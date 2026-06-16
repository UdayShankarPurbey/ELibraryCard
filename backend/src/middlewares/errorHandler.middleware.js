import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (error instanceof ZodError) {
    const errors = error.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    }));
    error = new ApiError(422, "Validation failed", errors);
  } else if (error?.name === "CastError") {
    error = new ApiError(400, `Invalid value for ${error.path}`);
  } else if (error?.name === "ValidationError") {
    const errors = Object.values(error.errors || {}).map((e) => ({
      path: e.path,
      message: e.message,
    }));
    error = new ApiError(422, "Validation failed", errors);
  } else if (error?.code === 11000) {
    const field = Object.keys(error.keyValue || {}).join(", ");
    error = new ApiError(409, `Duplicate value for ${field}`);
  } else if (!(error instanceof ApiError)) {
    error = new ApiError(error?.statusCode || 500, error?.message || "Internal server error");
  }

  const payload = {
    statusCode: error.statusCode,
    success: false,
    message: error.message,
    errors: error.errors,
  };

  if (env.nodeEnv === "development") {
    payload.stack = error.stack;
  }

  res.status(error.statusCode).json(payload);
};
