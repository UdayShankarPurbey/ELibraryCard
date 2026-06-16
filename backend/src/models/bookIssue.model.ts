import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IBookIssue extends Document {
  institution: Types.ObjectId;
  bookCopy: Types.ObjectId;
  member: Types.ObjectId;
  issuedBy?: Types.ObjectId;
  issuedAt: Date;
  dueAt: Date;
  returnedAt: Date | null;
  fineAmount: number;
  status: "issued" | "returned" | "overdue" | "lost";
  createdAt: Date;
  updatedAt: Date;
}

const bookIssueSchema = new Schema<IBookIssue>(
  {
    institution: { type: Schema.Types.ObjectId, ref: "Institution", required: true, index: true },
    bookCopy: { type: Schema.Types.ObjectId, ref: "BookCopy", required: true },
    member: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    issuedBy: { type: Schema.Types.ObjectId, ref: "User" },
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

export const BookIssue = mongoose.model<IBookIssue>("BookIssue", bookIssueSchema);
