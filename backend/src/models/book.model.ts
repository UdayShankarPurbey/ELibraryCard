import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IBook extends Document {
  institution: Types.ObjectId;
  data: Record<string, unknown>;
  coverUrl?: string;
  coverPublicId?: string;
  status: "active" | "archived";
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new Schema<IBook>(
  {
    institution: { type: Schema.Types.ObjectId, ref: "Institution", required: true, index: true },
    data: { type: Schema.Types.Mixed, default: {} },
    coverUrl: { type: String },
    coverPublicId: { type: String },
    status: { type: String, enum: ["active", "archived"], default: "active" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, minimize: false },
);

export const Book = mongoose.model<IBook>("Book", bookSchema);
