import winston from "winston";
import { env } from "../config/env.js";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const consoleFormat = combine(
  colorize(),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  printf((info) => {
    const { level, message, timestamp, stack } = info as {
      level: string;
      message: string;
      timestamp?: string;
      stack?: string;
    };
    return `${timestamp} ${level}: ${stack || message}`;
  }),
);

const fileFormat = combine(timestamp(), errors({ stack: true }), json());

export const logger = winston.createLogger({
  level: env.nodeEnv === "development" ? "debug" : "info",
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    new winston.transports.File({ filename: "logs/error.log", level: "error", format: fileFormat }),
    new winston.transports.File({ filename: "logs/combined.log", format: fileFormat }),
  ],
});
