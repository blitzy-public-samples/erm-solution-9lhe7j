import http from 'http';
import app from './app';
import config from './config/config';
import logger from './config/logger';
import sequelize from './config/database';
import redisClient from './config/redis';

const PORT: number = config.port || 3000;
let server: http.Server;

async function startServer(): Promise<void> {
  try {
    // Authenticate and sync the database
    await sequelize.authenticate();
    await sequelize.sync();
    logger.info('Database connection has been established successfully.');

    // Ensure Redis connection is established
    await redisClient.connect();
    logger.info('Redis connection has been established successfully.');

    // Create HTTP server with the Express app
    server = http.createServer(app);

    // Start listening on the specified PORT
    server.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Unable to start the server:', error);
    process.exit(1);
  }
}

async function gracefulShutdown(): Promise<void> {
  logger.info('Graceful shutdown initiated');

  try {
    // Close the HTTP server
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => {
          logger.info('HTTP server closed');
          resolve();
        });
      });
    }

    // Close the database connection
    await sequelize.close();
    logger.info('Database connection closed');

    // Quit the Redis client
    await redisClient.quit();
    logger.info('Redis connection closed');

    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
}

// Main execution block
startServer();

// Set up process event listeners for graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});