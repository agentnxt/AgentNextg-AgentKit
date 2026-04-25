import { Injectable, type OnModuleInit } from '@nestjs/common';
import { AsyncCall } from 'async-call-rpc';
import type { MessagePortMain } from 'electron';

import { IpcScanner, RENDERER_CONNECT_CHANNEL_NAME } from '../../ipc';
import type { RendererToHelper } from './types';

/**
 * Service that handles the initial bootstrap of the helper process
 * and sets up the connection to the renderer process
 */
@Injectable()
export class HelperBootstrapService implements OnModuleInit {
  constructor(private readonly ipcScanner: IpcScanner) {}

  /**
   * Initialize the helper process, setting up message listeners for renderer connection
   */
  onModuleInit(): void {
    console.log(`Helper bootstrap started`);
    // Check if we're in a worker environment with a parent port
    if (!process.parentPort) {
      console.error('Helper process was not started in a worker environment');
      return;
    }

    // Listen for 'renderer-connect' messages from the main process
    process.parentPort.on('message', e => {
      if (
        e.data.channel === RENDERER_CONNECT_CHANNEL_NAME &&
        e.ports.length === 1
      ) {
        this.connectToRenderer(e.ports[0]);
        console.debug('Renderer connected');
      }
    });

    console.log('Helper bootstrap complete, waiting for renderer connection');
  }

  connectToRenderer(rendererPort: MessagePortMain) {
    const handlers = this.ipcScanner.scanHandlers();
    const flattenedHandlers = Array.from(handlers.entries()).map(
      ([channel, handler]) => {
        const handlerWithLog = async (...args: any[]) => {
          try {
            const start = performance.now();
            const result = await handler(...args);
            console.debug(
              `${channel}`,
              'async-api',
              `${args.filter(
                arg => typeof arg !== 'function' && typeof arg !== 'object'
              )} - ${(performance.now() - start).toFixed(2)} ms`
            );
            return result;
          } catch (error) {
            // Enhanced error handling to prevent crashes
            console.error(`${channel}`, String(error), 'async-api');

            // Return structured error instead of throwing
            return {
              error: true,
              message:
                error instanceof Error
                  ? error.message
                  : 'Unknown handler error',
              code: 'HELPER_HANDLER_ERROR',
              channel,
              timestamp: Date.now(),
            };
          }
        };
        return [channel, handlerWithLog];
      }
    );

    AsyncCall<RendererToHelper>(Object.fromEntries(flattenedHandlers), {
      channel: {
        on(listener) {
          const f = (e: Electron.MessageEvent) => {
            try {
              listener(e.data);
            } catch (error) {
              // Prevent crashes from message handling errors
              console.error('Message handling error:', error);
            }
          };
          rendererPort.on('message', f);
          // MUST start the connection to receive messages
          rendererPort.start();
          return () => {
            rendererPort.off('message', f);
          };
        },
        send(data) {
          try {
            rendererPort.postMessage(data);
          } catch (error) {
            // Prevent crashes from message sending errors
            console.error('Message sending error:', error);
          }
        },
      },
      log: false,
    });
  }
}
