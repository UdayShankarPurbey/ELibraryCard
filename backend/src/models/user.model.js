import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      default: null,
      index: true,
    },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true, select: false },
    isSuperAdmin: { type: Boolean, default: false },
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

userSchema.index({ institution: 1, email: 1 }, { unique: true });

export const User = mongoose.model("User", userSchema);
