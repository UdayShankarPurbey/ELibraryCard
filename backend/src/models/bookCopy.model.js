import mongoose from "mongoose";

const bookCopySchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
      index: true,
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
      index: true,
    },
    barcode: { type: String, required: true, unique: true, trim: true },
    status: {
      type: String,
      enum: ["available", "issued", "lost", "damaged"],
      default: "available",
    },
  },
  { timestamps: true },
);

export const BookCopy = mongoose.model("BookCopy", bookCopySchema);
