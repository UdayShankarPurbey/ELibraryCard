import mongoose, { Schema, type Document } from "mongoose";

export interface IInstitutionSettings {
  barcodePrefix: string;
  barcodeSeq: number;
}

export interface IInstitution extends Document {
  name: string;
  slug: string;
  status: "active" | "suspended";
  settings: IInstitutionSettings;
  createdAt: Date;
  updatedAt: Date;
}

const institutionSchema = new Schema<IInstitution>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    settings: {
      barcodePrefix: { type: String, default: "", trim: true },
      barcodeSeq: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

export const Institution = mongoose.model<IInstitution>("Institution", institutionSchema);
