export enum IpcScope {
  UI = 'ui',
  APP_STATE = 'appState',
  PROJECT = 'project',
  MEDIA_ASSET = 'mediaAsset',
  MEDIA_ANALYZER = 'mediaAnalyzer',
  MENU = 'menu',
  HELPER = 'helper',
  EDIT_PIPELINE = 'editPipeline',
}

export const IPC_API_CHANNEL_NAME = 'ipc-api';
export const IPC_EVENT_CHANNEL_NAME = 'ipc-event';

export const RENDERER_CONNECT_CHANNEL_NAME = 'renderer-connect';
export const HELPER_CONNECT_CHANNEL_NAME = 'helper-connect';
export const WORKER_CONNECT_CHANNEL_NAME = 'worker-connect';
