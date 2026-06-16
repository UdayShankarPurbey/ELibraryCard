import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IRole extends Document {
  institution: Types.ObjectId;
  name: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    institution: { type: Schema.Types.ObjectId, ref: "Institution", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    permissions: [{ type: String }],
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true },
);

roleSchema.index({ institution: 1, name: 1 }, { unique: true });

export const Role = mongoose.model<IRole>("Role", roleSchema);
