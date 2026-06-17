import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { resolveInstitutionId } from "../utils/tenant.js";
import * as settingsService from "../services/settings.service.js";

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.getSettings(resolveInstitutionId(req));
  res.status(200).json(new ApiResponse(200, settings, "Settings"));
});

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.updateSettings(resolveInstitutionId(req), req.body);
  res.status(200).json(new ApiResponse(200, settings, "Settings updated"));
});
