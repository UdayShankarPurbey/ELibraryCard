import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cacheGet, cacheSet } from "../config/redis.js";
import { CACHE_KEYS, CACHE_TTL, USER_STATUS } from "../utils/constants.js";
import { User } from "../models/index.js";

const extractToken = (req) => {
  const fromCookie = req.cookies?.accessToken;
  const header = req.headers.authorization || "";
  const fromHeader = header.startsWith("Bearer ") ? header.slice(7) : null;
  return fromCookie || fromHeader;
};

const loadPermissions = async (user) => {
  if (user.isSuperAdmin) return [];
  const cacheKey = CACHE_KEYS.userPermissions(user._id.toString());
  const cached = await cacheGet(cacheKey).catch(() => null);
  if (cached) return cached;

  const populated = await user.populate("roles", "permissions");
  const permissions = [
    ...new Set((populated.roles || []).flatMap((r) => r.permissions || [])),
  ];
  await cacheSet(cacheKey, permissions, CACHE_TTL.PERMISSIONS).catch(() => {});
  return permissions;
};

export const verifyJWT = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) throw new ApiError(401, "Unauthorized");

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwt.accessSecret);
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await User.findById(decoded.id);
  if (!user || user.status !== USER_STATUS.ACTIVE) {
    throw new ApiError(401, "User no longer active");
  }

  req.user = {
    id: user._id,
    institution: user.institution,
    isSuperAdmin: user.isSuperAdmin,
    permissions: await loadPermissions(user),
  };
  next();
});
