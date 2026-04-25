import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { isAbsolute, join } from 'node:path';

import { ArkErrors, Type } from 'arktype';
import { app } from 'electron';
import { BehaviorSubject, Observable } from 'rxjs';

import { beforeAppQuit } from '../cleanup';
import { logger } from '../logger';

export interface JsonStateServiceOptions<T> {
  beforeStateUpdate?: (state: T) => T;
  afterStateLoad?: (state: T) => T;
  beforeStateSave?: (state: T) => T;
  saveDebounceMs?: number;
}

export interface JsonStateService<T> {
  getState(): T;
  getState$(): Observable<T>;
  updateState(update: Partial<T>): Promise<void>;
  resetState(): Promise<void>;
  flush(): Promise<void>;
  destroy(): void;
}

export function createJsonStateService<T extends Record<string, any>>(
  filepath: string,
  defaultState: T,
  schema: Type<T>,
  options: JsonStateServiceOptions<T> = {}
): JsonStateService<T> {
  const {
    beforeStateUpdate = (state: T) => state,
    afterStateLoad = (state: T) => state,
    beforeStateSave = (state: T) => state,
    saveDebounceMs = 1000,
  } = options;

  // Resolve file path
  const stateFilePath = isAbsolute(filepath)
    ? filepath
    : join(app.getPath('userData'), filepath);

  // Internal state
  const stateSubject$ = new BehaviorSubject<T>(defaultState);
  let savePromise: Promise<void> | null = null;
  let saveTimeout: NodeJS.Timeout | null = null;
  let hasPendingChanges = false;
  let isDestroyed = false;

  // Service name for logging
  const serviceName = `JsonStateService(${filepath})`;

  // Private methods
  const scheduleSave = (): void => {
    if (isDestroyed) return;

    hasPendingChanges = true;

    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(() => {
      performDebouncedSave().catch(error => {
        logger.error(
          `Failed to save ${serviceName} in debounced operation:`,
          error
        );
      });
    }, saveDebounceMs);
  };

  const performDebouncedSave = async (): Promise<void> => {
    saveTimeout = null;
    if (hasPendingChanges && !isDestroyed) {
      await saveState();
      hasPendingChanges = false;
    }
  };

  const saveState = async (): Promise<void> => {
    if (isDestroyed) return;

    // Prevent concurrent saves
    if (savePromise) {
      await savePromise;
    }

    savePromise = performSave();
    await savePromise;
    savePromise = null;
  };

  const performSave = async (): Promise<void> => {
    if (isDestroyed) return;

    try {
      const state = stateSubject$.value;
      const stateToSave = beforeStateSave(state);
      const stateJson = JSON.stringify(stateToSave, null, 2);

      // Ensure directory exists
      await mkdir(join(stateFilePath, '..'), { recursive: true });

      await writeFile(stateFilePath, stateJson, 'utf-8');
      logger.log(`${serviceName} saved successfully`);
    } catch (error) {
      logger.error(`Failed to save ${serviceName}:`, error);
      throw error;
    }
  };

  const loadState = async (): Promise<void> => {
    if (isDestroyed) return;

    try {
      const data = await readFile(stateFilePath, 'utf-8');
      const parsedState = JSON.parse(data);

      // Validate loaded state
      const validation = schema(parsedState);

      if (validation instanceof ArkErrors) {
        logger.warn(
          `Loaded ${serviceName} is invalid, using defaults:`,
          validation.summary
        );
        await saveState(); // Save defaults immediately on validation failure
        return;
      }

      // Merge with defaults to ensure all properties exist
      const mergedState = deepMerge(defaultState, parsedState);
      const finalState = afterStateLoad(mergedState);

      stateSubject$.next(finalState);
      logger.log(`${serviceName} ${stateFilePath} loaded successfully`);
    } catch (error: any) {
      // Only log if it's not a "file not found" error
      if (error.code !== 'ENOENT') {
        logger.warn(`Failed to load ${serviceName}, using defaults:`, error);
      }
      await saveState(); // Save defaults immediately on first load
    }
  };

  const deepMerge = <U extends Record<string, any>>(
    target: U,
    source: Partial<U>
  ): U => {
    const result = { ...target };

    for (const key in source) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key])
      ) {
        result[key] = deepMerge(result[key] || ({} as any), source[key]);
      } else if (source[key] !== undefined) {
        result[key] = source[key] as U[Extract<keyof U, string>];
      }
    }

    return result;
  };

  // Initialize
  const initialize = async () => {
    await loadState();

    // Register cleanup on app quit
    beforeAppQuit(() => {
      flush();
    });

    logger.log(`${serviceName} initialized`);
  };

  // Public API
  const getState = (): T => stateSubject$.value;

  const getReactiveState = (): Observable<T> => stateSubject$.asObservable();

  const updateState = async (update: Partial<T>): Promise<void> => {
    if (isDestroyed) {
      throw new Error(`${serviceName} has been destroyed`);
    }

    const currentState = getState();
    const newState = deepMerge(currentState, update);

    // Validate the new state using arktype
    const validation = schema(newState);

    if (validation instanceof ArkErrors) {
      const errorMessage = `State validation failed: ${validation.summary}`;
      logger.error(errorMessage, validation);
      throw new Error(errorMessage);
    }

    // Allow custom modification before saving
    const finalState = beforeStateUpdate(newState);

    stateSubject$.next(finalState);
    scheduleSave();

    logger.log(`${serviceName} updated successfully`);
  };

  const resetState = async (): Promise<void> => {
    if (isDestroyed) {
      throw new Error(`${serviceName} has been destroyed`);
    }

    const newState = beforeStateUpdate({ ...defaultState });

    stateSubject$.next(newState);
    scheduleSave();

    logger.log(`${serviceName} reset to defaults`);
  };

  const flush = async (): Promise<void> => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }

    if (hasPendingChanges && !isDestroyed) {
      await saveState();
      hasPendingChanges = false;
      logger.log(`${serviceName} flushed successfully`);
    }
  };

  const destroy = (): void => {
    isDestroyed = true;

    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }

    stateSubject$.complete();
    logger.log(`${serviceName} destroyed`);
  };

  // Initialize and return the service
  initialize().catch(error => {
    logger.error(`Failed to initialize ${serviceName}:`, error);
  });

  return {
    getState,
    // eslint-disable-next-line rxjs/finnish
    getState$: getReactiveState,
    updateState,
    resetState,
    flush,
    destroy,
  };
}
