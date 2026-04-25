import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { DefinePlugin, IgnorePlugin } from '@rspack/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../../..');

/** @type {import('@rspack/core').Configuration} */
export default {
  context: projectRoot,
  experiments: { topLevelAwait: true, outputModule: true },
  entry: { index: './packages/backend/server/src/index.ts' },
  output: {
    filename: 'main.mjs',
    path: join(__dirname, 'dist'),
    clean: true,
    globalObject: 'globalThis',
    module: true,
    chunkFormat: 'module',
    library: {
      type: 'module',
    },
  },
  target: ['node', 'es2022'],
  externals: async ({ request }) => {
    if (
      request &&
      // import ... from 'module'
      /^[a-zA-Z@]/.test(request) &&
      // not relative imports
      !request.startsWith('.') &&
      // not absolute paths
      !request.startsWith('/') &&
      // not workspace deps except native packages
      (!request.startsWith('@afk/') || request.includes('native')) &&
      // not problematic ESM modules
      !['lru-cache', '@apollo/', 'semver'].some(
        mod => request === mod || request.startsWith(mod + '/')
      )
    ) {
      // Mark as external using ES module imports
      return `module ${request}`;
    }
    return false;
  },
  externalsPresets: { node: true },
  node: { __dirname: false, __filename: false, global: false },
  mode: 'production',
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.node'],
    extensionAlias: {
      '.js': ['.js', '.ts'],
      '.mjs': ['.mjs', '.mts'],
    },
  },
  module: {
    parser: { javascript: { url: false, importMeta: false } },
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        include: /@blocksuite/,
        use: ['source-map-loader'],
      },
      {
        test: /\.node$/,
        type: 'asset/resource',
        generator: {
          filename: '[name][ext]',
        },
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              preserveAllComments: true,
              parser: {
                syntax: 'typescript',
                dynamicImport: true,
                topLevelAwait: true,
                tsx: true,
                decorators: true,
              },
              target: 'es2022',
              externalHelpers: false,
              transform: {
                legacyDecorator: true,
                decoratorMetadata: true,
                react: { runtime: 'automatic' },
              },
              minify: {
                mangle: false, // Don't mangle identifiers
                compress: false,
              },
            },
            sourceMaps: true,
            inlineSourcesContent: true,
          },
        },
      },
    ],
  },
  plugins: [
    new DefinePlugin({
      'process.env.NODE_ENV': '"production"',
    }),
    // Ignore optional dependencies that are not needed
    new IgnorePlugin({
      checkResource(resource) {
        const lazyImports = [
          '@nestjs/microservices',
          '@nestjs/websockets/socket-module',
          '@apollo/subgraph',
          '@apollo/gateway',
          '@as-integrations/fastify',
          'ts-morph',
          'class-validator',
          'class-transformer',
        ];
        return lazyImports.some(lazyImport => resource.startsWith(lazyImport));
      },
    }),
  ],
  optimization: {
    nodeEnv: false,
    minimize: false,
    splitChunks: false,
    usedExports: false,
    sideEffects: false,
    mangleExports: false,
  },
  performance: { hints: false },
  stats: { errorDetails: true },
};
