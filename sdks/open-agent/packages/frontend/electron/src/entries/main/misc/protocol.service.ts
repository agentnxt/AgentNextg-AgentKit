import { join } from 'node:path';

import { Injectable, type OnModuleInit } from '@nestjs/common';
import { app, net, protocol } from 'electron';

import { anotherHost, mainHost, resourcesPath } from '../constants';
import { logger } from '../logger';
import { ensureAppReady } from '../utils';

export function registerSchemes() {
  logger.log('registering schemes');
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'assets',
      privileges: {
        secure: false,
        corsEnabled: true,
        supportFetchAPI: true,
        standard: true,
        bypassCSP: true,
        stream: true,
      },
    },
  ]);

  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'file',
      privileges: {
        secure: false,
        corsEnabled: true,
        supportFetchAPI: true,
        standard: true,
        bypassCSP: true,
        stream: true,
      },
    },
  ]);
}

registerSchemes();

const webStaticDir = join(resourcesPath, 'web-static');

@Injectable()
export class ProtocolService implements OnModuleInit {
  async onModuleInit() {
    await ensureAppReady();
    this.setupInterceptors();
  }

  private readonly handleFileRequest = async (request: Request) => {
    const urlObject = new URL(request.url);

    if (urlObject.host === anotherHost) {
      urlObject.host = mainHost;
    }

    const isAbsolutePath = urlObject.host !== '.';
    const isViteDevServer = urlObject.pathname.includes('/@vite');

    // Redirect to webpack dev server if defined
    if (process.env.DEV_SERVER_URL && (!isAbsolutePath || isViteDevServer)) {
      const devServerUrl = new URL(
        urlObject.pathname,
        process.env.DEV_SERVER_URL
      );
      logger.log('redirecting to dev server', devServerUrl.toString());
      return net.fetch(devServerUrl.toString(), request);
    }
    const clonedRequest = Object.assign(request.clone(), {
      bypassCustomProtocolHandlers: true,
    });
    // this will be file types (in the web-static folder)
    let filepath = '';

    // for relative path, load the file in resources
    if (!isAbsolutePath) {
      if (urlObject.pathname.split('/').at(-1)?.includes('.')) {
        // Sanitize pathname to prevent path traversal attacks
        const decodedPath = decodeURIComponent(urlObject.pathname);
        const normalizedPath = join(webStaticDir, decodedPath).normalize();
        if (!normalizedPath.startsWith(webStaticDir)) {
          // Attempted path traversal - reject by using empty path
          filepath = join(webStaticDir, '');
        } else {
          filepath = normalizedPath;
        }
      } else {
        // else, fallback to load the index.html instead
        filepath = join(webStaticDir, 'index.html');
      }
    } else {
      filepath = decodeURIComponent(urlObject.pathname);
      // security check if the filepath is within app.getPath('sessionData')
      const sessionDataPath = app.getPath('sessionData');
      const tempPath = app.getPath('temp');
      if (
        !filepath.startsWith(sessionDataPath) &&
        !filepath.startsWith(tempPath)
      ) {
        throw new Error('Invalid filepath', { cause: filepath });
      }
    }
    return net.fetch('file://' + filepath, clonedRequest);
  };

  setupInterceptors = () => {
    logger.log('setting up interceptors', 'ProtocolService');
    protocol.handle('file', request => {
      return this.handleFileRequest(request);
    });

    protocol.handle('assets', async request => {
      try {
        const urlObject = new URL(request.url);

        let decodedPath = '';

        // Support assets://absolute?path=<encoded> or assets:///<encoded>
        if (urlObject.host === 'absolute') {
          decodedPath = decodeURIComponent(
            urlObject.searchParams.get('path') || ''
          );
        } else {
          decodedPath = decodeURIComponent(
            urlObject.pathname.startsWith('/')
              ? urlObject.pathname.slice(1)
              : urlObject.pathname
          );
        }

        // Security check
        const allowedRoots = [
          app.getPath('home'),
          app.getPath('temp'),
          app.getPath('sessionData'),
          resourcesPath,
        ];
        if (!allowedRoots.some(r => decodedPath.startsWith(r))) {
          logger.warn('Blocked access to disallowed asset path', decodedPath);
          return new Response('Forbidden', { status: 403 });
        }

        // Gather file stats
        const { statSync, createReadStream } = await import('node:fs');
        const stats = statSync(decodedPath);

        const range = request.headers.get('range');
        let start = 0;
        let end = stats.size - 1;
        let status = 200;

        if (range) {
          const match = /bytes=(\d+)-(\d*)/.exec(range);
          if (match) {
            start = parseInt(match[1], 10);
            if (match[2]) {
              end = parseInt(match[2], 10);
            }
            if (isNaN(start) || start >= stats.size) {
              return new Response('Requested range not satisfiable', {
                status: 416,
                headers: {
                  'Content-Range': `bytes */${stats.size}`,
                },
              });
            }
            status = 206;
          }
        }

        const chunkSize = end - start + 1;
        const stream = createReadStream(decodedPath, { start, end });

        const headers: Record<string, string> = {
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
        };

        if (status === 206) {
          headers['Content-Range'] = `bytes ${start}-${end}/${stats.size}`;
        }

        // rudimentary mime type
        if (decodedPath.endsWith('.mp4')) {
          headers['Content-Type'] = 'video/mp4';
        } else if (decodedPath.endsWith('.mkv')) {
          headers['Content-Type'] = 'video/x-matroska';
        } else if (decodedPath.endsWith('.webm')) {
          headers['Content-Type'] = 'video/webm';
        } else if (decodedPath.endsWith('.png')) {
          headers['Content-Type'] = 'image/png';
        } else if (
          decodedPath.endsWith('.jpg') ||
          decodedPath.endsWith('.jpeg')
        ) {
          headers['Content-Type'] = 'image/jpeg';
        } else {
          headers['Content-Type'] = 'application/octet-stream';
        }

        return new Response(stream as any, { status, headers });
      } catch (error) {
        logger.error('Failed to handle assets protocol request', error);
        return new Response('Internal Server Error', { status: 500 });
      }
    });
  };
}
