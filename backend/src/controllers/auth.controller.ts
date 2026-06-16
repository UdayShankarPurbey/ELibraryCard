import type { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { accessCookieOptions, refreshCookieOptions } from "../utils/tokens.js";
import { TOKEN_COOKIES } from "../utils/constants.js";
import * as authService from "../services/auth.service.js";

const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie(TOKEN_COOKIES.ACCESS, accessToken, accessCookieOptions);
  res.cookie(TOKEN_COOKIES.REFRESH, refreshToken, refreshCookieOptions);
};

export const bootstrapSuperAdmin = asyncHandler(async (req, res) => {
  const user = await authService.bootstrapSuperAdmin(req.body);
  res.status(201).json(new ApiResponse(201, { user }, "Super admin created"));
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  setAuthCookies(res, result.accessToken, result.refreshToken);
  res.status(200).json(new ApiResponse(200, result, "Logged in"));
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) throw new ApiError(401, "Refresh token missing");
  const result = await authService.refresh(token);
  setAuthCookies(res, result.accessToken, result.refreshToken);
  res.status(200).json(new ApiResponse(200, result, "Token refreshed"));
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user!.id);
  res.clearCookie(TOKEN_COOKIES.ACCESS, accessCookieOptions);
  res.clearCookie(TOKEN_COOKIES.REFRESH, refreshCookieOptions);
  res.status(200).json(new ApiResponse(200, null, "Logged out"));
});

export const me = asyncHandler(async (req, res) => {
  const result = await authService.getCurrentUser(req.user!.id);
  res.status(200).json(new ApiResponse(200, result, "Current user"));
});

export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user!.id, req.body.oldPassword, req.body.newPassword);
  res.status(200).json(new ApiResponse(200, null, "Password changed"));
});
