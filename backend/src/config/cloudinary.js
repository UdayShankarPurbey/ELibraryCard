import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import { env } from "./env.js";

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
});

export const uploadToCloudinary = async (localPath, folder = "elibrarycard") => {
  if (!localPath) return null;
  try {
    const result = await cloudinary.uploader.upload(localPath, {
      folder,
      resource_type: "auto",
    });
    return result;
  } finally {
    await fs.unlink(localPath).catch(() => {});
  }
};

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  return cloudinary.uploader.destroy(publicId);
};
