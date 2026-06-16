import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import { initFirebase } from "./config/firebase.js";
import { logger } from "./utils/logger.js";

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

  app.listen(env.port, () => {
    logger.info(`Server running on http://localhost:${env.port}`);
  });
};

start().catch((error) => {
  logger.error(`Failed to start server: ${error.message}`);
  process.exit(1);
});
