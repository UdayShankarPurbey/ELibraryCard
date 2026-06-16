import jwt, { type JwtPayload } from "jsonwebtoken";
import { type Types } from "mongoose";
import type { Request } from "express";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cacheGet, cacheSet } from "../config/redis.js";
import { CACHE_KEYS, CACHE_TTL, USER_STATUS } from "../utils/constants.js";
import { User, type IUser } from "../models/user.model.js";

const extractToken = (req: Request): string | null => {
  const fromCookie = req.cookies?.accessToken;
  const header = req.headers.authorization || "";
  const fromHeader = header.startsWith("Bearer ") ? header.slice(7) : null;
  return fromCookie || fromHeader;
};

const loadPermissions = async (user: IUser): Promise<string[]> => {
  if (user.isSuperAdmin) return [];
  const userId = (user._id as Types.ObjectId).toString();
  const cacheKey = CACHE_KEYS.userPermissions(userId);
  const cached = await cacheGet<string[]>(cacheKey).catch(() => null);
  if (cached) return cached;

  const populated = await user.populate("roles", "permissions");
  const roles = (populated.roles || []) as unknown as { permissions: string[] }[];
  const permissions = [...new Set(roles.flatMap((r) => r.permissions || []))];
  await cacheSet(cacheKey, permissions, CACHE_TTL.PERMISSIONS).catch(() => {});
  return permissions;
};

export const verifyJWT = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) throw new ApiError(401, "Unauthorized");

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, env.jwt.accessSecret) as JwtPayload;
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await User.findById(decoded.id);
  if (!user || user.status !== USER_STATUS.ACTIVE) {
    throw new ApiError(401, "User no longer active");
  }

  req.user = {
    id: user._id as Types.ObjectId,
    institution: user.institution,
    isSuperAdmin: user.isSuperAdmin,
    permissions: await loadPermissions(user),
  };
  next();
});
