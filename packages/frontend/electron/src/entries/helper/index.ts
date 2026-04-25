import { bootstrap } from './bootstrap';

// Global error handlers to prevent helper process crashes
process.on('uncaughtException', error => {
  console.error('Helper process uncaught exception:', error);
  // Don't exit the process, just log the error
  // This prevents crashes from external API failures
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(
    'Helper process unhandled rejection at:',
    promise,
    'reason:',
    reason
  );
  // Don't exit the process, just log the error
  // This prevents crashes from external API failures
});

// Handle stream errors that might occur with external APIs
process.on('warning', warning => {
  console.warn('Helper process warning:', warning);
});

bootstrap().catch(err => {
  console.error('Helper bootstrap error:', err);
  // Don't exit immediately, give the helper a chance to recover
  setTimeout(() => {
    console.error('Exiting helper due to bootstrap failure');
    process.exit(1);
  }, 1000);
});
