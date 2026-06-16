import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IUser extends Document {
  institution: Types.ObjectId | null;
  fullName: string;
  email: string;
  phone?: string;
  passwordHash: string;
  refreshTokenHash?: string;
  isSuperAdmin: boolean;
  roles: Types.ObjectId[];
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    institution: { type: Schema.Types.ObjectId, ref: "Institution", default: null, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true, select: false },
    refreshTokenHash: { type: String, select: false },
    isSuperAdmin: { type: Boolean, default: false },
    roles: [{ type: Schema.Types.ObjectId, ref: "Role" }],
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

userSchema.index({ institution: 1, email: 1 }, { unique: true });

export const User = mongoose.model<IUser>("User", userSchema);
