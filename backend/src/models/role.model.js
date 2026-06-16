import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    permissions: [{ type: String }],
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

roleSchema.index({ institution: 1, name: 1 }, { unique: true });

export const Role = mongoose.model("Role", roleSchema);
