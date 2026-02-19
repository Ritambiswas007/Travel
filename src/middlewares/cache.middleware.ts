import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';
import { cache } from '../utils/cache';

export type CacheMiddlewareOptions = {
  /** Cache key prefix for this route (e.g. "packages:list") */
  keyPrefix: string;
  /** TTL in seconds (default from config) */
  ttlSeconds?: number;
  /** Build cache key from request (default: path + sorted query string) */
  keyBuilder?: (req: Request) => string;
};

function defaultKeyBuilder(req: Request): string {
  const q = req.query && Object.keys(req.query).length
    ? `?${Object.entries(req.query)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${String(v)}`)
        .join('&')}`
    : '';
  return `${req.path}${q}`;
}

/**
 * Middleware that caches GET responses in Redis and returns cached body on hit.
 * Only runs when REDIS_URL is set. On cache miss, wraps res.json to cache then send.
 */
export function cacheMiddleware(options: CacheMiddlewareOptions) {
  const ttl = options.ttlSeconds ?? config.redis.defaultTtlSeconds;
  const keyBuilder = options.keyBuilder ?? defaultKeyBuilder;

  return async function redisCache(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    if (req.method !== 'GET' || !config.redis.enabled) {
      next();
      return;
    }

    const cacheKey = `${options.keyPrefix}:${keyBuilder(req)}`;

    try {
      const cached = await cache.get<{ success: boolean; data: unknown }>(cacheKey);
      if (cached && cached.success !== undefined) {
        res.status(200).json(cached);
        return;
      }
    } catch {
      // proceed without cache
    }

    const originalJson = res.json.bind(res);
    res.json = function (body: unknown): Response {
      if (res.statusCode === 200 && body && typeof body === 'object') {
        cache.set(cacheKey, body, ttl).catch(() => {});
      }
      return originalJson(body);
    };

    next();
  };
}

export default cacheMiddleware;
