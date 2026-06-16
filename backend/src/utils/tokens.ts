import jwt, { type SignOptions } from "jsonwebtoken";
import type { CookieOptions } from "express";
import { env } from "../config/env.js";

export interface TokenPayload {
  id: string;
  isSuperAdmin: boolean;
}

export const signAccessToken = (payload: TokenPayload): string =>
  jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpiry } as SignOptions);

export const signRefreshToken = (payload: TokenPayload): string =>
  jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiry } as SignOptions);

export const verifyRefreshToken = (token: string): TokenPayload =>
  jwt.verify(token, env.jwt.refreshSecret) as TokenPayload;

const baseCookie: CookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "lax",
};

export const accessCookieOptions: CookieOptions = {
  ...baseCookie,
  maxAge: 15 * 60 * 1000,
};

export const refreshCookieOptions: CookieOptions = {
  ...baseCookie,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
