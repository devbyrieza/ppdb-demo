import Redis from 'ioredis';

// Create a singleton instance of Redis
const globalForRedis = global as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis ||
  new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    // password: process.env.REDIS_PASSWORD || undefined,
    connectTimeout: 5000,
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 50, 2000);
    },
  });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

// Helper to safely stringify and set JSON data
export async function setCache(key: string, data: any, ttlSeconds: number = 3600) {
  try {
    const stringData = JSON.stringify(data);
    await redis.set(key, stringData, 'EX', ttlSeconds);
    return true;
  } catch (error) {
    console.error('Redis Set Error:', error);
    return false;
  }
}

// Helper to get and parse JSON data
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    console.error('Redis Get Error:', error);
    return null;
  }
}

export default redis;
