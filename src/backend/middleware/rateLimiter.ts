import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../config/redis';
import { config } from '../config/config';

// Rate limiter for general API requests
export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:api:',
  }),
  windowMs: config.rateLimit.api.windowMs,
  max: config.rateLimit.api.max,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for authentication requests
export const authLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:auth:',
  }),
  windowMs: config.rateLimit.auth.windowMs,
  max: config.rateLimit.auth.max,
  message: 'Too many authentication attempts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Helper function to check if an IP is whitelisted
const isWhitelisted = (ip: string): boolean => {
  return config.rateLimit.whitelist.includes(ip);
};

// Middleware to skip rate limiting for whitelisted IPs
export const skipIfWhitelisted = (req: any, res: any, next: any) => {
  if (isWhitelisted(req.ip)) {
    return next();
  }
  return apiLimiter(req, res, next);
};

// Middleware to add rate limit headers to the response
export const addRateLimitHeaders = (req: any, res: any, next: any) => {
  res.on('finish', () => {
    if (res.get('X-RateLimit-Limit')) {
      res.set('X-RateLimit-Limit', res.get('X-RateLimit-Limit'));
      res.set('X-RateLimit-Remaining', res.get('X-RateLimit-Remaining'));
      res.set('X-RateLimit-Reset', res.get('X-RateLimit-Reset'));
    }
  });
  next();
};

// Log rate limit violations
const logRateLimitViolation = (req: any) => {
  console.warn(`Rate limit exceeded for IP: ${req.ip}`);
  // TODO: Implement more sophisticated logging (e.g., to a file or external service)
};

// Enhance rate limiters with logging
const enhanceWithLogging = (limiter: any) => {
  return (req: any, res: any, next: any) => {
    limiter(req, res, (err: any) => {
      if (err instanceof Error) {
        logRateLimitViolation(req);
      }
      next(err);
    });
  };
};

export const apiLimiterWithLogging = enhanceWithLogging(apiLimiter);
export const authLimiterWithLogging = enhanceWithLogging(authLimiter);