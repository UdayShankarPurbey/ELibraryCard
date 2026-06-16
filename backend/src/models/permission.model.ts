import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IPermission extends Document {
  institution: Types.ObjectId;
  key: string;
  label: string;
  group: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const permissionSchema = new Schema<IPermission>(
  {
    institution: { type: Schema.Types.ObjectId, ref: "Institution", required: true, index: true },
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    group: { type: String, trim: true, default: "general" },
    description: { type: String, trim: true },
  },
  { timestamps: true },
);

permissionSchema.index({ institution: 1, key: 1 }, { unique: true });

export const Permission = mongoose.model<IPermission>("Permission", permissionSchema);
