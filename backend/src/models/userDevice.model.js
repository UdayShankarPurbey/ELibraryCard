import mongoose from "mongoose";

const userDeviceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fcmToken: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

export const UserDevice = mongoose.model("UserDevice", userDeviceSchema);
