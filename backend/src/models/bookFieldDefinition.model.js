import mongoose from "mongoose";

const bookFieldDefinitionSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
      index: true,
    },
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
  { timestamps: true }
);

bookFieldDefinitionSchema.index({ institution: 1, fieldKey: 1 }, { unique: true });

export const BookFieldDefinition = mongoose.model(
  "BookFieldDefinition",
  bookFieldDefinitionSchema
);
