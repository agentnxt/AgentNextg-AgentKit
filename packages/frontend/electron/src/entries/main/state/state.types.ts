import { type } from 'arktype';

// Define the base state schema using arktype
export const AppStateSchema = type({
  settings: {
    windowSettings: {
      width: 'number',
      height: 'number',
      x: 'number',
      y: 'number',
      maximized: 'boolean',
      fullscreen: 'boolean',
    },
  },
  activeProjectId: 'string?',
  projects: type({
    id: 'string',
    filePath: 'string',
    lastOpened: 'Date',
    title: 'string',
  }).array(),
});

// Infer the TypeScript type from the arktype schema
export type AppState = typeof AppStateSchema.infer;

// Default state that matches the schema
export const defaultAppState: AppState = {
  settings: {
    windowSettings: {
      width: 1200,
      height: 800,
      x: 100,
      y: 100,
      maximized: false,
      fullscreen: false,
    },
  },
  projects: [],
};

// Partial update schema for state updates
export const StateUpdateSchema = type('Record<string, unknown>');
export type StateUpdate = Partial<AppState>;
