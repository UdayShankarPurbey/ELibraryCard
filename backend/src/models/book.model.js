import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
      index: true,
    },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    coverUrl: { type: String },
    coverPublicId: { type: String },
    status: { type: String, enum: ["active", "archived"], default: "active" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, minimize: false },
);

export const Book = mongoose.model("Book", bookSchema);
