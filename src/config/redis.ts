import Redis from 'ioredis';
import { config } from './env';
import { logger } from '../utils/logger';

let redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (!config.redis.enabled || !config.redis.url) {
    return null;
  }
  if (!redis) {
    try {
      redis = new Redis(config.redis.url, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          if (times > 3) return null;
          return Math.min(times * 200, 2000);
        },
      });
      redis.on('error', (err) => logger.warn('Redis error', err));
      redis.on('connect', () => logger.info('Redis connected'));
    } catch (e) {
      logger.warn('Redis init failed', e);
      return null;
    }
  }
  return redis;
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

export default getRedis;
