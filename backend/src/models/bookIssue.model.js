import mongoose from "mongoose";

const bookIssueSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
      index: true,
    },
    bookCopy: { type: mongoose.Schema.Types.ObjectId, ref: "BookCopy", required: true },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    issuedAt: { type: Date, default: Date.now },
    dueAt: { type: Date, required: true },
    returnedAt: { type: Date, default: null },
    fineAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["issued", "returned", "overdue", "lost"],
      default: "issued",
    },
  },
  { timestamps: true },
);

export const BookIssue = mongoose.model("BookIssue", bookIssueSchema);
