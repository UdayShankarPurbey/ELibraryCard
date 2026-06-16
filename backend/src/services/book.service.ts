import { type Types } from "mongoose";
import { Book } from "../models/book.model.js";
import { BookCopy } from "../models/bookCopy.model.js";
import {
  BookFieldDefinition,
  type IBookFieldDefinition,
} from "../models/bookFieldDefinition.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";
import type { ListBooksQuery } from "../validators/book.validator.js";

interface BookWriteInput {
  data?: Record<string, unknown>;
  status?: "active" | "archived";
  coverPath?: string | null;
  createdBy?: Types.ObjectId;
}

const getDefs = (institutionId: string) =>
  BookFieldDefinition.find({ institution: institutionId }).sort({ sortOrder: 1 });

export const validateBookData = (
  defs: IBookFieldDefinition[],
  data: Record<string, unknown>,
  partial: boolean,
): Record<string, unknown> => {
  const defByKey = new Map(defs.map((d) => [d.fieldKey, d]));
  const unknown = Object.keys(data).filter((k) => !defByKey.has(k));
  if (unknown.length) throw new ApiError(422, `Unknown book fields: ${unknown.join(", ")}`);

  const result: Record<string, unknown> = {};
  const errors: { path: string; message: string }[] = [];

  for (const def of defs) {
    const has = Object.prototype.hasOwnProperty.call(data, def.fieldKey);
    const raw = data[def.fieldKey];
    const empty = raw === undefined || raw === null || raw === "";

    if (!has || empty) {
      if (!partial && def.isRequired) {
        errors.push({ path: def.fieldKey, message: `${def.label} is required` });
      }
      continue;
    }

    switch (def.dataType) {
      case "string":
        result[def.fieldKey] = String(raw);
        break;
      case "number": {
        const n = Number(raw);
        if (Number.isNaN(n))
          errors.push({ path: def.fieldKey, message: `${def.label} must be a number` });
        else result[def.fieldKey] = n;
        break;
      }
      case "boolean": {
        if (typeof raw === "boolean") result[def.fieldKey] = raw;
        else if (raw === "true" || raw === "false") result[def.fieldKey] = raw === "true";
        else errors.push({ path: def.fieldKey, message: `${def.label} must be a boolean` });
        break;
      }
      case "date": {
        const d = new Date(raw as string);
        if (Number.isNaN(d.getTime()))
          errors.push({ path: def.fieldKey, message: `${def.label} must be a date` });
        else result[def.fieldKey] = d;
        break;
      }
      case "enum": {
        const v = String(raw);
        if (def.options.includes(v)) result[def.fieldKey] = v;
        else
          errors.push({
            path: def.fieldKey,
            message: `${def.label} must be one of: ${def.options.join(", ")}`,
          });
        break;
      }
    }
  }

  if (errors.length) throw new ApiError(422, "Book data validation failed", errors);
  return result;
};

export const createBook = async (institutionId: string, input: BookWriteInput) => {
  const defs = await getDefs(institutionId);
  const data = validateBookData(defs, input.data ?? {}, false);

  let coverUrl: string | undefined;
  let coverPublicId: string | undefined;
  if (input.coverPath) {
    const uploaded = await uploadToCloudinary(
      input.coverPath,
      `elibrarycard/${institutionId}/books`,
    );
    if (uploaded) {
      coverUrl = uploaded.secure_url;
      coverPublicId = uploaded.public_id;
    }
  }

  return Book.create({
    institution: institutionId,
    data,
    status: input.status ?? "active",
    coverUrl,
    coverPublicId,
    createdBy: input.createdBy,
  });
};

export const listBooks = async (institutionId: string, q: ListBooksQuery) => {
  const page = q.page ?? 1;
  const limit = q.limit ?? 20;
  const filter: Record<string, unknown> = { institution: institutionId };
  if (q.status) filter.status = q.status;

  const [items, total] = await Promise.all([
    Book.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Book.countDocuments(filter),
  ]);
  return { items, total, page, limit };
};

export const getBook = async (institutionId: string, id: string) => {
  const book = await Book.findOne({ _id: id, institution: institutionId });
  if (!book) throw new ApiError(404, "Book not found");
  const copies = await BookCopy.find({ book: id }).sort({ createdAt: 1 });
  return { book, copies };
};

export const updateBook = async (institutionId: string, id: string, input: BookWriteInput) => {
  const book = await Book.findOne({ _id: id, institution: institutionId });
  if (!book) throw new ApiError(404, "Book not found");

  if (input.data) {
    const defs = await getDefs(institutionId);
    const coerced = validateBookData(defs, input.data, true);
    book.data = { ...book.data, ...coerced };
    book.markModified("data");
  }
  if (input.status) book.status = input.status;
  if (input.coverPath) {
    const uploaded = await uploadToCloudinary(
      input.coverPath,
      `elibrarycard/${institutionId}/books`,
    );
    if (uploaded) {
      if (book.coverPublicId) await deleteFromCloudinary(book.coverPublicId).catch(() => {});
      book.coverUrl = uploaded.secure_url;
      book.coverPublicId = uploaded.public_id;
    }
  }

  await book.save();
  return book;
};

export const deleteBook = async (institutionId: string, id: string) => {
  const book = await Book.findOne({ _id: id, institution: institutionId });
  if (!book) throw new ApiError(404, "Book not found");

  const issued = await BookCopy.exists({ book: id, status: "issued" });
  if (issued) throw new ApiError(409, "Cannot delete: some copies are currently issued");

  await BookCopy.deleteMany({ book: id });
  await book.deleteOne();
  if (book.coverPublicId) await deleteFromCloudinary(book.coverPublicId).catch(() => {});
};
