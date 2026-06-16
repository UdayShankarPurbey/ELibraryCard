import type { Server } from "http";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDb, disconnectDb } from "./config/db.js";
import { connectRedis, redis } from "./config/redis.js";
import { initFirebase } from "./config/firebase.js";
import { logger } from "./utils/logger.js";

let server: Server | undefined;
let shuttingDown = false;

const shutdown = async (signal: string) => {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`${signal} received — shutting down`);
  setTimeout(() => process.exit(1), 5000).unref();

  if (server) await new Promise<void>((resolve) => server!.close(() => resolve()));
  await disconnectDb().catch(() => {});
  await redis.quit().catch(() => {});
  process.exit(0);
};

const start = async () => {
  await connectDb();
  logger.info("MongoDB connected");

  try {
    await connectRedis();
    logger.info("Redis connected");
  } catch {
    logger.warn("Redis unavailable — continuing without cache");
  }

  if (initFirebase()) logger.info("Firebase messaging ready");

  server = app.listen(env.port, () => {
    logger.info(`Server running on http://localhost:${env.port}`);
  });
};

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

start().catch((error: unknown) => {
  logger.error(`Failed to start server: ${(error as Error).message}`);
  process.exit(1);
});
