import { bootstrap } from './bootstrap';
import { logger } from './logger';

// Global error handlers to prevent server crashes
process.on('uncaughtException', error => {
  logger.error('Uncaught Exception:', error);
  // Don't exit the process, just log the error
  // This prevents crashes from external API failures
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
  // This prevents crashes from external API failures
});

// Handle stream errors that might occur with external APIs
process.on('warning', warning => {
  logger.warn('Process warning:', warning);
});

bootstrap().catch(err => {
  logger.error('Bootstrap error:', err);
  // Don't exit immediately, give the app a chance to recover
  setTimeout(() => {
    logger.error('Exiting due to bootstrap failure');
    process.exit(1);
  }, 1000);
});
