import Redis from "ioredis";
import { env } from "./env.js";

export const redis = new Redis(env.redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 2,
});

export const connectRedis = async () => {
  if (redis.status === "ready" || redis.status === "connecting") return;
  await redis.connect();
};

export const cacheGet = async (key) => {
  const value = await redis.get(key);
  return value ? JSON.parse(value) : null;
};

export const cacheSet = async (key, value, ttlSeconds) => {
  const payload = JSON.stringify(value);
  if (ttlSeconds) {
    await redis.set(key, payload, "EX", ttlSeconds);
  } else {
    await redis.set(key, payload);
  }
};

export const cacheDel = async (key) => {
  await redis.del(key);
};
