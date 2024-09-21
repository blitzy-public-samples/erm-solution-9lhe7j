import winston from 'winston';
import config from 'src/backend/config/config';

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

const createLogger = (): winston.Logger => {
  const logger = winston.createLogger({
    levels: logLevels,
    level: config.isDevelopment ? 'debug' : 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.colorize({ colors: logColors }),
      winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level}]: ${message}`;
      })
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.simple(),
      }),
    ],
  });

  if (config.isProduction) {
    logger.add(
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      })
    );
    logger.add(
      new winston.transports.File({
        filename: 'logs/combined.log',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      })
    );
  }

  return logger;
};

const logger = createLogger();

export { logger };