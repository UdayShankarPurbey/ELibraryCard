import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
      index: true,
    },
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    group: { type: String, trim: true, default: "general" },
    description: { type: String, trim: true },
  },
  { timestamps: true },
);

permissionSchema.index({ institution: 1, key: 1 }, { unique: true });

export const Permission = mongoose.model("Permission", permissionSchema);
