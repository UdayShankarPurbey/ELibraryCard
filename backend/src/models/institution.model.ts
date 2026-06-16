import mongoose, { Schema, type Document } from "mongoose";

export interface IInstitution extends Document {
  name: string;
  slug: string;
  status: "active" | "suspended";
  createdAt: Date;
  updatedAt: Date;
}

const institutionSchema = new Schema<IInstitution>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
  },
  { timestamps: true },
);

export const Institution = mongoose.model<IInstitution>("Institution", institutionSchema);
