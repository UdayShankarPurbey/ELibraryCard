import { type Types } from "mongoose";
import { BookIssue } from "../models/bookIssue.model.js";
import { BookCopy } from "../models/bookCopy.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { withTransaction } from "../config/db.js";
import { DEFAULT_LOAN_DAYS, FINE_PER_DAY } from "../utils/constants.js";
import type {
  IssueInput,
  ReturnInput,
  ListIssuesQuery,
} from "../validators/circulation.validator.js";

const DAY = 24 * 60 * 60 * 1000;

const computeDueAt = (input: IssueInput): Date => {
  if (input.dueAt) {
    const d = new Date(input.dueAt);
    if (Number.isNaN(d.getTime())) throw new ApiError(400, "Invalid dueAt");
    return d;
  }
  return new Date(Date.now() + (input.loanDays ?? DEFAULT_LOAN_DAYS) * DAY);
};

export const issueBook = async (
  institutionId: string,
  input: IssueInput,
  issuedBy: Types.ObjectId,
) => {
  const member = await User.findOne({ _id: input.memberId, institution: institutionId });
  if (!member) throw new ApiError(404, "Member not found");
  if (member.status !== "active") throw new ApiError(400, "Member is inactive");

  const copy = await BookCopy.findOne({ _id: input.bookCopyId, institution: institutionId });
  if (!copy) throw new ApiError(404, "Copy not found");

  const dueAt = computeDueAt(input);

  return withTransaction(async (session) => {
    const opts = session ? { session } : {};
    // Guarded flip: only claim a copy that is still available — prevents double-issue.
    const claimed = await BookCopy.findOneAndUpdate(
      { _id: input.bookCopyId, institution: institutionId, status: "available" },
      { status: "issued" },
      { new: true, ...opts },
    );
    if (!claimed) throw new ApiError(409, "Copy is not available");

    try {
      const [issue] = await BookIssue.create(
        [
          {
            institution: institutionId,
            bookCopy: input.bookCopyId,
            member: input.memberId,
            issuedBy,
            dueAt,
            status: "issued",
          },
        ],
        opts,
      );
      return issue;
    } catch (error) {
      if (!session) await BookCopy.updateOne({ _id: input.bookCopyId }, { status: "available" });
      throw error;
    }
  });
};

export const returnBook = async (institutionId: string, input: ReturnInput) => {
  const filter: Record<string, unknown> = {
    institution: institutionId,
    status: { $in: ["issued", "overdue"] },
  };
  if (input.issueId) filter._id = input.issueId;
  else filter.bookCopy = input.bookCopyId;

  const issue = await BookIssue.findOne(filter);
  if (!issue) throw new ApiError(404, "Active issue not found");

  const now = new Date();
  let fine = 0;
  if (now.getTime() > issue.dueAt.getTime()) {
    const days = Math.ceil((now.getTime() - issue.dueAt.getTime()) / DAY);
    fine = days * FINE_PER_DAY;
  }

  return withTransaction(async (session) => {
    const opts = session ? { session } : {};
    issue.returnedAt = now;
    issue.fineAmount = fine;
    issue.status = "returned";
    await issue.save(opts);
    await BookCopy.updateOne(
      { _id: issue.bookCopy, institution: institutionId },
      { status: "available" },
      opts,
    );
    return issue;
  });
};

export const markLost = async (institutionId: string, issueId: string) => {
  const issue = await BookIssue.findOne({
    _id: issueId,
    institution: institutionId,
    status: { $in: ["issued", "overdue"] },
  });
  if (!issue) throw new ApiError(404, "Active issue not found");

  return withTransaction(async (session) => {
    const opts = session ? { session } : {};
    issue.status = "lost";
    issue.returnedAt = new Date();
    await issue.save(opts);
    await BookCopy.updateOne(
      { _id: issue.bookCopy, institution: institutionId },
      { status: "lost" },
      opts,
    );
    return issue;
  });
};

export const listIssues = async (institutionId: string, q: ListIssuesQuery) => {
  const page = q.page ?? 1;
  const limit = q.limit ?? 20;
  const filter: Record<string, unknown> = { institution: institutionId };
  if (q.memberId) filter.member = q.memberId;
  if (q.overdue === "true") {
    filter.status = "issued";
    filter.dueAt = { $lt: new Date() };
  } else if (q.status) {
    filter.status = q.status;
  }

  const [items, total] = await Promise.all([
    BookIssue.find(filter)
      .populate("member", "fullName email")
      .populate("bookCopy", "barcode")
      .sort({ issuedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    BookIssue.countDocuments(filter),
  ]);
  return { items, total, page, limit };
};

export const listMyIssues = async (memberId: Types.ObjectId) =>
  BookIssue.find({ member: memberId }).populate("bookCopy", "barcode").sort({ issuedAt: -1 });
