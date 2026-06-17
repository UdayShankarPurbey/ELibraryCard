import { connectDb, disconnectDb } from "../config/db.js";
import { seedData } from "./seedData.js";
import { logger } from "../utils/logger.js";

const run = async () => {
  await connectDb();
  await seedData();
  await disconnectDb();
};

run().catch((err) => {
  logger.error("Seeding failed", err);
  process.exit(1);
});
