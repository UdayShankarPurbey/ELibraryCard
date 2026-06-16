import Redis from "ioredis";
import { env } from "./env.js";

export const redis = new Redis(env.redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 1000)),
});

let warned = false;
redis.on("error", (err) => {
  if (!warned) {
    console.warn(`Redis error — cache disabled (${err.code || err.message})`);
    warned = true;
  }
});

export const connectRedis = async () => {
  if (redis.status === "ready" || redis.status === "connecting") return;
  await redis.connect();
};

const isReady = () => redis.status === "ready";

export const cacheGet = async (key) => {
  if (!isReady()) return null;
  const value = await redis.get(key);
  return value ? JSON.parse(value) : null;
};

export const cacheSet = async (key, value, ttlSeconds) => {
  if (!isReady()) return;
  const payload = JSON.stringify(value);
  if (ttlSeconds) {
    await redis.set(key, payload, "EX", ttlSeconds);
  } else {
    await redis.set(key, payload);
  }
};

export const cacheDel = async (key) => {
  if (!isReady()) return;
  await redis.del(key);
};
