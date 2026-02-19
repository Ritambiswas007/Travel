import { getRedis } from '../config/redis';
import { config } from '../config/env';

const PREFIX = 'api:';
const defaultTtl = config.redis.defaultTtlSeconds;

function keyWithPrefix(k: string): string {
  return `${PREFIX}${k}`;
}

export const cache = {
  async get<T = unknown>(key: string): Promise<T | null> {
    const client = getRedis();
    if (!client) return null;
    try {
      const raw = await client.get(keyWithPrefix(key));
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async set(key: string, value: unknown, ttlSeconds: number = defaultTtl): Promise<void> {
    const client = getRedis();
    if (!client) return;
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds > 0) {
        await client.setex(keyWithPrefix(key), ttlSeconds, serialized);
      } else {
        await client.set(keyWithPrefix(key), serialized);
      }
    } catch {
      // ignore
    }
  },

  async del(key: string): Promise<void> {
    const client = getRedis();
    if (!client) return;
    try {
      await client.del(keyWithPrefix(key));
    } catch {
      // ignore
    }
  },

  /** Delete all keys matching prefix (e.g. "packages" to invalidate packages:* ) */
  async delByPrefix(prefix: string): Promise<void> {
    const client = getRedis();
    if (!client) return;
    try {
      const fullPrefix = keyWithPrefix(prefix);
      let cursor = '0';
      do {
        const [next, keys] = await client.scan(cursor, 'MATCH', `${fullPrefix}*`, 'COUNT', 100);
        cursor = next;
        if (keys.length) await client.del(...keys);
      } while (cursor !== '0');
    } catch {
      // ignore
    }
  },
};

export default cache;
