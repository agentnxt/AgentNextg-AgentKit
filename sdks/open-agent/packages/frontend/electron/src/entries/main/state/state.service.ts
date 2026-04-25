import {
  Injectable,
  OnModuleInit,
  OnApplicationShutdown,
} from '@nestjs/common';

import { IpcHandle, IpcScope, IpcEvent } from '../../../ipc';
import { createJsonStateService } from './json-state.factory';
import {
  AppStateSchema,
  defaultAppState,
  type AppState,
  type StateUpdate,
} from './state.types';

@Injectable()
export class StateService implements OnModuleInit, OnApplicationShutdown {
  private stateService = createJsonStateService(
    'app-state.json',
    defaultAppState,
    AppStateSchema
  );

  @IpcEvent({ scope: IpcScope.APP_STATE })
  state$ = this.getState$();

  async onModuleInit() {
    // Factory handles initialization
  }

  async onApplicationShutdown() {
    await this.stateService.flush();
    this.stateService.destroy();
  }

  // Delegate methods to the factory-created service
  getState(): AppState {
    return this.stateService.getState();
  }

  getState$() {
    return this.stateService.getState$();
  }

  async updateState(update: StateUpdate): Promise<void> {
    return this.stateService.updateState(update);
  }

  async resetState(): Promise<void> {
    return this.stateService.resetState();
  }

  async flush(): Promise<void> {
    return this.stateService.flush();
  }

  // IPC handlers for renderer process
  @IpcHandle({ scope: IpcScope.APP_STATE })
  handleGetState(): AppState {
    return this.getState();
  }

  @IpcHandle({ scope: IpcScope.APP_STATE })
  handleUpdateState(update: StateUpdate): Promise<void> {
    return this.updateState(update);
  }

  @IpcHandle({ scope: IpcScope.APP_STATE })
  handleResetState(): Promise<void> {
    return this.resetState();
  }

  @IpcHandle({ scope: IpcScope.APP_STATE })
  handleFlushState(): Promise<void> {
    return this.flush();
  }
}
