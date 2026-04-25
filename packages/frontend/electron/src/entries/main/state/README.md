# State Module

A JSON-based state management system for the main Electron process with arktype validation. Built with a factory pattern for maximum flexibility and reusability.

## Features

- **Type-safe**: Full TypeScript support with arktype schema validation
- **Persistent**: Automatically saves state to JSON file in user data directory
- **Optimized**: Debounced saving (1s) to handle frequent updates efficiently
- **Observable**: RxJS observables for reactive state updates
- **IPC Support**: Built-in IPC handlers for renderer process communication
- **Deep Merge**: Smart deep merging of state updates
- **Flush Support**: Immediate save capability with auto-flush on app quit
- **Error Handling**: Comprehensive error handling with logging

## Architecture

### Factory Pattern

The `createJsonStateService<T>()` factory function provides the core functionality:

- Generic type-safe state management
- Debounced saving with flush capability
- Arktype schema validation
- Lifecycle management
- Error handling and logging

### Creating Custom State Services

```typescript
import { Injectable, OnModuleInit, OnApplicationShutdown } from '@nestjs/common';
import { type } from 'arktype';
import { createJsonStateService, JsonStateService } from './json-state.factory';

// Define your schema
const MyStateSchema = type({
  property1: 'string',
  property2: 'number',
  lastModified: 'number',
});

type MyState = typeof MyStateSchema.infer;

@Injectable()
export class MyStateService implements OnModuleInit, OnApplicationShutdown {
  private stateService: JsonStateService<MyState>;

  constructor() {
    this.stateService = createJsonStateService(
      'my-state.json', // filepath (relative to userData or absolute)
      defaultMyState,
      MyStateSchema,
      {
        // Optional hooks
        beforeStateUpdate: state => ({ ...state, lastModified: Date.now() }),
        saveDebounceMs: 2000, // Custom debounce time
      }
    );
  }

  async onModuleInit() {
    // Factory handles initialization automatically
  }

  async onApplicationShutdown() {
    await this.stateService.flush();
    this.stateService.destroy();
  }

  // Delegate methods
  getState() {
    return this.stateService.getState();
  }
  async updateState(update: Partial<MyState>) {
    return this.stateService.updateState(update);
  }
}
```

### Factory Options

```typescript
interface JsonStateServiceOptions<T> {
  beforeStateUpdate?: (state: T) => T; // Hook before state updates
  afterStateLoad?: (state: T) => T; // Hook after loading from file
  beforeStateSave?: (state: T) => T; // Hook before saving to file
  saveDebounceMs?: number; // Custom debounce time (default: 1000ms)
}
```

## Usage

### Using Built-in Services

```typescript
import { StateService } from './state';

// Inject in your service
constructor(private stateService: StateService) {}

// Get current state
const currentState = this.stateService.getState();

// Subscribe to state changes
this.stateService.getState$().subscribe(state => {
  console.log('State updated:', state);
});

// Update state (debounced save)
await this.stateService.updateState({
  settings: {
    theme: 'dark',
    autoSave: false,
  },
});

// Force immediate save
await this.stateService.flush();
```

### Creating Standalone State Services

```typescript
import { createJsonStateService } from './json-state.factory';

// Create a standalone service (not NestJS)
const myState = createJsonStateService('/absolute/path/to/my-state.json', { count: 0, name: 'test' }, type({ count: 'number', name: 'string' }), {
  saveDebounceMs: 500, // Faster saves
  beforeStateUpdate: state => ({ ...state, updatedAt: Date.now() }),
});

// Use it directly
await myState.updateState({ count: 1 });
const current = myState.getState();
await myState.flush();
myState.destroy(); // Cleanup when done
```

### Using State Utils

```typescript
import { createStateUpdate, getNestedValue } from './state';

// Create type-safe updates
const settingsUpdate = createStateUpdate('settings', {
  theme: 'dark',
});

// Get nested values safely
const theme = getNestedValue(state, 'settings.theme', 'system');
```

### IPC from Renderer

```typescript
// In renderer process
import { ipcRenderer } from 'electron';

// Get state
const state = await ipcRenderer.invoke('getState');

// Update state
await ipcRenderer.invoke('updateState', {
  userPreferences: {
    recentFiles: ['file1.txt', 'file2.txt'],
  },
});

// Listen to state changes
ipcRenderer.on('state', (_, state) => {
  console.log('State updated:', state);
});

// Force immediate save from renderer
await ipcRenderer.invoke('flushState');
```

## Available Services

### StateService (app-state.json)

Application-wide state with schema:

- `version`: Application version
- `settings`: App-wide settings (theme, autoSave, language, windowSettings)
- `userPreferences`: User-specific data (recentFiles, workspaceSettings)
- `session`: Session data (lastModified, isFirstRun)

### UserPreferencesService (user-preferences.json)

User preferences with schema:

- `appearance`: fontSize, fontFamily, colorScheme
- `editor`: tabSize, insertSpaces, wordWrap, showLineNumbers
- `shortcuts`: Key-command mappings
- `extensions`: enabled/disabled extensions list

## File Locations

State files are persisted to the userData directory:

- `{userData}/app-state.json` - Main application state
- `{userData}/user-preferences.json` - User preferences
- `{userData}/{custom-filename}.json` - Custom state services

## Performance Optimization

The state module uses a **debounced saving mechanism** (1 second delay) to efficiently handle frequent updates:

- Multiple rapid updates are batched together
- Only one disk write occurs per debounce period
- Automatic flush on app quit ensures no data loss
- Manual flush available for critical updates

## Error Handling

- Invalid state updates are rejected with validation errors
- Corrupted state files are automatically reset to defaults
- All operations are logged for debugging
- Failed debounced saves are logged but don't crash the app
