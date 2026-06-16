import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import fs from "fs/promises";
import { env } from "./env.js";

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
});

export const uploadToCloudinary = async (
  localPath: string,
  folder = "elibrarycard",
): Promise<UploadApiResponse | null> => {
  if (!localPath) return null;
  try {
    return await cloudinary.uploader.upload(localPath, { folder, resource_type: "auto" });
  } finally {
    await fs.unlink(localPath).catch(() => {});
  }
};

export const deleteFromCloudinary = async (publicId: string) => {
  if (!publicId) return null;
  return cloudinary.uploader.destroy(publicId);
};
