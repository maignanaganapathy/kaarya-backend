import app from './app';
import { APP_CONFIG } from './initializers/app';
import Database from './initializers/database';
import logger from './initializers/logger';

const PORT = APP_CONFIG.port;

/**
 * Start Server
 */
const startServer = async () => {
  try {
    // Connect to database
    await Database.connect();
    logger.info('Database connected successfully');

    // Start listening
    app.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT}`);
      logger.info(`📝 Environment: ${APP_CONFIG.nodeEnv}`);
      logger.info(`🌐 API URL: http://localhost:${PORT}/api`);
      logger.info(`💚 Health check: http://localhost:${PORT}/api/health`);
      logger.info(`📚 API Docs: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Handle graceful shutdown
 */
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await Database.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await Database.disconnect();
  process.exit(0);
});

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer();
