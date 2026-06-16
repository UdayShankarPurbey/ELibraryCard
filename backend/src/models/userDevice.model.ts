import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IUserDevice extends Document {
  user: Types.ObjectId;
  fcmToken: string;
  createdAt: Date;
  updatedAt: Date;
}

const userDeviceSchema = new Schema<IUserDevice>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fcmToken: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

export const UserDevice = mongoose.model<IUserDevice>("UserDevice", userDeviceSchema);
