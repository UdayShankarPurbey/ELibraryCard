import mongoose, { type ClientSession } from "mongoose";
import { env } from "./env.js";

let transactionsSupported = false;

export const connectDb = async () => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongodbUri, { serverSelectionTimeoutMS: 10000 });
  try {
    const db = mongoose.connection.db;
    const info = db ? await db.admin().command({ hello: 1 }) : {};
    transactionsSupported = Boolean(info.setName) || info.msg === "isdbgrid";
  } catch {
    transactionsSupported = false;
  }
  return mongoose.connection;
};

export const disconnectDb = async () => {
  await mongoose.disconnect();
};

export const withTransaction = async <T>(
  work: (session: ClientSession | null) => Promise<T>,
): Promise<T> => {
  if (!transactionsSupported) {
    return work(null);
  }
  const session = await mongoose.startSession();
  try {
    let result!: T;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
};
