import { Request, Response, NextFunction } from 'express';
import { ApiError } from 'src/backend/utils/ApiError';
import { config } from 'src/backend/config/config';
import logger from 'src/backend/config/logger'; // Assuming you have a logger configured

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let stack: string | undefined;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  if (config.nodeEnv === 'development') {
    stack = err.stack;
  }

  // Log the error
  logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  logger.error('Error stack:', err.stack);

  // Prepare the error response
  const errorResponse: Record<string, any> = {
    success: false,
    message,
    ...(config.nodeEnv === 'development' && { stack }),
  };

  // Send the error response
  res.status(statusCode).json(errorResponse);
};