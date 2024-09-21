import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';

import authRoutes from './routes/authRoutes';
import riskRoutes from './routes/riskRoutes';
import assessmentRoutes from './routes/assessmentRoutes';
import reportRoutes from './routes/reportRoutes';
import userRoutes from './routes/userRoutes';

import errorHandler from './middleware/errorHandler';
import apiLimiter from './middleware/rateLimiter';

import config from './config/config';
import logger from './config/logger';

const app: express.Application = express();

function configureMiddleware(): void {
  app.use(helmet());
  app.use(cors(config.corsOptions));
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(compression());
  app.use(apiLimiter);

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../public')));
  }
}

function configureRoutes(): void {
  app.use('/api/auth', authRoutes);
  app.use('/api/risks', riskRoutes);
  app.use('/api/assessments', assessmentRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/users', userRoutes);

  // Catch-all route for handling 404 errors
  app.use((req, res) => {
    res.status(404).json({ message: 'Not Found' });
  });
}

function configureErrorHandling(): void {
  app.use(errorHandler);
}

// Configure the application
configureMiddleware();
configureRoutes();
configureErrorHandling();

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Closing HTTP server.');
  // Implement any cleanup or graceful shutdown logic here
  process.exit(0);
});

export default app;