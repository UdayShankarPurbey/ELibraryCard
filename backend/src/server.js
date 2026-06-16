import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import { initFirebase } from "./config/firebase.js";

const start = async () => {
  await connectDb();
  console.log("MongoDB connected");

  try {
    await connectRedis();
    console.log("Redis connected");
  } catch {
    console.warn("Redis unavailable — continuing without cache");
  }

  if (initFirebase()) console.log("Firebase messaging ready");

  app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
  });
};

start().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
