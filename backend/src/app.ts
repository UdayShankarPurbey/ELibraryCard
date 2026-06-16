import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import "./models/index.js";
import { ApiError } from "./utils/ApiError.js";
import { ApiResponse } from "./utils/ApiResponse.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { authRouter } from "./routes/auth.routes.js";
import { institutionRouter } from "./routes/institution.routes.js";
import { permissionRouter } from "./routes/permission.routes.js";

const app = express();

app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json(new ApiResponse(200, { status: "ok" }, "Service healthy"));
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/institutions/:institutionId/permissions", permissionRouter);
app.use("/api/v1/institutions", institutionRouter);

app.use((_req, _res, next) => next(new ApiError(404, "Route not found")));

app.use(errorHandler);

export { app };
