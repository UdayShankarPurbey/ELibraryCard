import mongoose, { type ClientSession } from "mongoose";
import { env } from "./env.js";

export const connectDb = async () => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongodbUri, { serverSelectionTimeoutMS: 10000 });
  return mongoose.connection;
};

export const disconnectDb = async () => {
  await mongoose.disconnect();
};

export const withTransaction = async <T>(
  work: (session: ClientSession | null) => Promise<T>,
): Promise<T> => {
  const session = await mongoose.startSession();
  try {
    let result!: T;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } catch (error) {
    const err = error as { code?: number; message?: string };
    if (err.code === 20 || /Transaction numbers|replica set/i.test(err.message || "")) {
      return work(null);
    }
    throw error;
  } finally {
    await session.endSession();
  }
};
