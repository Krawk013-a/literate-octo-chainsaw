import { env } from './config/env';
import { startServer, gracefulShutdown } from './server';

// Export app and server for testing
export { createApp, createServer, startServer, gracefulShutdown } from './server';

// Start server if not in test environment
if (env.NODE_ENV !== 'test') {
  startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

  // Handle graceful shutdown
  const signals = ['SIGTERM', 'SIGINT'] as const;
  signals.forEach((signal) => {
    process.on(signal, async () => {
      await gracefulShutdown();
      process.exit(0);
    });
  });

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
}
