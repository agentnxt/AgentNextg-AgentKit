import { type } from 'arktype';

import type { AppState } from './state.types';

/**
 * Helper function to create type-safe state update objects
 */
export function createStateUpdate<K extends keyof AppState>(
  key: K,
  value: Partial<AppState[K]>
): { [P in K]: Partial<AppState[P]> } {
  return { [key]: value } as { [P in K]: Partial<AppState[P]> };
}

/**
 * Helper function to validate partial state updates
 */
export function validateStateUpdate(
  update: unknown
): update is Partial<AppState> {
  // Create a loose validation schema for partial updates
  const PartialStateSchema = type('Record<string, unknown>');
  const result = PartialStateSchema(update);
  return !(result instanceof type.errors);
}

/**
 * Helper function to safely get nested state values
 */
export function getNestedValue<T>(
  obj: Record<string, any>,
  path: string,
  defaultValue?: T
): T | undefined {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return defaultValue;
    }
  }

  return current as T;
}

/**
 * Helper function to create a deep clone of state
 */
export function cloneState<T>(state: T): T {
  return JSON.parse(JSON.stringify(state));
}
