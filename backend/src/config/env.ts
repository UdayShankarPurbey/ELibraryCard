import dotenv from "dotenv";

dotenv.config();

const required = ["MONGODB_URI", "ACCESS_TOKEN_SECRET", "REFRESH_TOKEN_SECRET"] as const;

const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(`Missing required env vars: ${missing.join(", ")}`);
}

export const env = {
  port: Number(process.env.PORT) || 8000,
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  mongodbUri: process.env.MONGODB_URI as string,
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  jwt: {
    accessSecret: process.env.ACCESS_TOKEN_SECRET as string,
    accessExpiry: process.env.ACCESS_TOKEN_EXPIRY || "15m",
    refreshSecret: process.env.REFRESH_TOKEN_SECRET as string,
    refreshExpiry: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  mail: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM || "ELibraryCard <no-reply@example.com>",
  },
  firebaseServiceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
};
