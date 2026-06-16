import bcrypt from "bcrypt";
import { createHash } from "node:crypto";
import { type Types } from "mongoose";
import { User, type IUser } from "../models/user.model.js";
import { Institution } from "../models/institution.model.js";
import { ApiError } from "../utils/ApiError.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  type TokenPayload,
} from "../utils/tokens.js";
import { cacheDel } from "../config/redis.js";
import { CACHE_KEYS } from "../utils/constants.js";
import type { BootstrapInput, LoginInput } from "../validators/auth.validator.js";

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

const sanitize = (user: IUser) => ({
  id: user._id as Types.ObjectId,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  institution: user.institution,
  isSuperAdmin: user.isSuperAdmin,
  roles: user.roles,
  status: user.status,
});

const issueTokens = async (user: IUser) => {
  const payload: TokenPayload = {
    id: (user._id as Types.ObjectId).toString(),
    isSuperAdmin: user.isSuperAdmin,
  };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};

export const bootstrapSuperAdmin = async (input: BootstrapInput) => {
  const exists = await User.exists({ isSuperAdmin: true });
  if (exists) throw new ApiError(403, "Super admin already exists");
  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await User.create({
    fullName: input.fullName,
    email: input.email,
    passwordHash,
    isSuperAdmin: true,
    institution: null,
  });
  return sanitize(user);
};

export const login = async (input: LoginInput) => {
  let institutionId: Types.ObjectId | null = null;
  if (input.institutionSlug) {
    const inst = await Institution.findOne({ slug: input.institutionSlug });
    if (!inst) throw new ApiError(404, "Institution not found");
    if (inst.status !== "active") throw new ApiError(403, "Institution is suspended");
    institutionId = inst._id as Types.ObjectId;
  }

  const user = await User.findOne({ email: input.email, institution: institutionId }).select(
    "+passwordHash",
  );
  if (!user) throw new ApiError(401, "Invalid credentials");
  if (user.status !== "active") throw new ApiError(403, "Account is inactive");

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) throw new ApiError(401, "Invalid credentials");

  const tokens = await issueTokens(user);
  return { user: sanitize(user), ...tokens };
};

export const refresh = async (token: string) => {
  let payload: TokenPayload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(payload.id).select("+refreshTokenHash");
  if (!user || !user.refreshTokenHash || user.refreshTokenHash !== hashToken(token)) {
    throw new ApiError(401, "Session expired");
  }

  const tokens = await issueTokens(user);
  return { user: sanitize(user), ...tokens };
};

export const logout = async (userId: Types.ObjectId | string) => {
  await User.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } });
  await cacheDel(CACHE_KEYS.userPermissions(userId.toString())).catch(() => {});
};

export const getCurrentUser = async (userId: Types.ObjectId | string) => {
  const user = await User.findById(userId).populate("roles", "name permissions");
  if (!user) throw new ApiError(404, "User not found");
  const roles = (user.roles || []) as unknown as { name: string; permissions: string[] }[];
  const permissions = user.isSuperAdmin
    ? ["*"]
    : [...new Set(roles.flatMap((r) => r.permissions || []))];
  return { user: sanitize(user), roles, permissions };
};

export const changePassword = async (
  userId: Types.ObjectId | string,
  oldPassword: string,
  newPassword: string,
) => {
  const user = await User.findById(userId).select("+passwordHash");
  if (!user) throw new ApiError(404, "User not found");
  const ok = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!ok) throw new ApiError(400, "Current password is incorrect");
  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.refreshTokenHash = undefined;
  await user.save({ validateBeforeSave: false });
};
