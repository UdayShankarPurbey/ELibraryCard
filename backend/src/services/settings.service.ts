import { Institution } from "../models/institution.model.js";
import { ApiError } from "../utils/ApiError.js";
import type { UpdateSettingsInput } from "../validators/settings.validator.js";

export const getSettings = async (institutionId: string) => {
  const inst = await Institution.findById(institutionId).select("settings");
  if (!inst) throw new ApiError(404, "Institution not found");
  return { barcodePrefix: inst.settings?.barcodePrefix ?? "" };
};

export const updateSettings = async (institutionId: string, input: UpdateSettingsInput) => {
  const inst = await Institution.findByIdAndUpdate(
    institutionId,
    { $set: { "settings.barcodePrefix": input.barcodePrefix } },
    { new: true, runValidators: true },
  ).select("settings");
  if (!inst) throw new ApiError(404, "Institution not found");
  return { barcodePrefix: inst.settings?.barcodePrefix ?? "" };
};
