import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDb = async () => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongodbUri, {
    serverSelectionTimeoutMS: 10000,
  });
  return mongoose.connection;
};

export const disconnectDb = async () => {
  await mongoose.disconnect();
};

// Runs `work` inside a transaction when the server supports it (replica set).
// Falls back to running without a transaction on standalone servers.
export const withTransaction = async (work) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } catch (error) {
    if (error?.code === 20 || /Transaction numbers|replica set/i.test(error?.message || "")) {
      return work(null);
    }
    throw error;
  } finally {
    await session.endSession();
  }
};
