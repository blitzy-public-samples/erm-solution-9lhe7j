import Redis from 'ioredis';
import config from './config';

const createRedisClient = (): Redis.Redis => {
  const redisClient = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  redisClient.on('connect', () => {
    console.log('Redis client connected');
  });

  redisClient.on('ready', () => {
    console.log('Redis client ready');
  });

  redisClient.on('error', (err) => {
    console.error('Redis client error:', err);
  });

  redisClient.on('close', () => {
    console.log('Redis client connection closed');
  });

  return redisClient;
};

export const redisClient = createRedisClient();

export const testRedisConnection = async (): Promise<void> => {
  try {
    await redisClient.set('test_key', 'test_value');
    const value = await redisClient.get('test_key');
    if (value === 'test_value') {
      console.log('Redis connection test successful');
    } else {
      throw new Error('Redis connection test failed: unexpected value');
    }
  } catch (error) {
    console.error('Redis connection test failed:', error);
    throw error;
  }
};