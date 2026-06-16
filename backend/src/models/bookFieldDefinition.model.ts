import mongoose, { Schema, type Document, type Types } from "mongoose";

export type FieldDataType = "string" | "number" | "boolean" | "date" | "enum";

export interface IBookFieldDefinition extends Document {
  institution: Types.ObjectId;
  fieldKey: string;
  label: string;
  dataType: FieldDataType;
  isRequired: boolean;
  options: string[];
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const bookFieldDefinitionSchema = new Schema<IBookFieldDefinition>(
  {
    institution: { type: Schema.Types.ObjectId, ref: "Institution", required: true, index: true },
    fieldKey: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    dataType: {
      type: String,
      enum: ["string", "number", "boolean", "date", "enum"],
      default: "string",
    },
    isRequired: { type: Boolean, default: false },
    options: [{ type: String }],
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

bookFieldDefinitionSchema.index({ institution: 1, fieldKey: 1 }, { unique: true });

export const BookFieldDefinition = mongoose.model<IBookFieldDefinition>(
  "BookFieldDefinition",
  bookFieldDefinitionSchema,
);
