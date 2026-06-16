import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IBookCopy extends Document {
  book: Types.ObjectId;
  institution: Types.ObjectId;
  barcode: string;
  status: "available" | "issued" | "lost" | "damaged";
  createdAt: Date;
  updatedAt: Date;
}

const bookCopySchema = new Schema<IBookCopy>(
  {
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    institution: { type: Schema.Types.ObjectId, ref: "Institution", required: true, index: true },
    barcode: { type: String, required: true, unique: true, trim: true },
    status: {
      type: String,
      enum: ["available", "issued", "lost", "damaged"],
      default: "available",
    },
  },
  { timestamps: true },
);

export const BookCopy = mongoose.model<IBookCopy>("BookCopy", bookCopySchema);
