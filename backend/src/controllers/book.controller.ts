import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { resolveInstitutionId } from "../utils/tenant.js";
import * as bookService from "../services/book.service.js";
import { listBooksSchema, bookStatusSchema } from "../validators/book.validator.js";

const parseData = (body: Record<string, unknown>): Record<string, unknown> => {
  let data = body.data;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      throw new ApiError(400, "Invalid data JSON");
    }
  }
  if (data && typeof data === "object") return data as Record<string, unknown>;
  return {};
};

const parseStatus = (value: unknown) => {
  if (value === undefined) return undefined;
  const parsed = bookStatusSchema.safeParse(value);
  if (!parsed.success) throw new ApiError(400, "Invalid status");
  return parsed.data;
};

export const createBook = asyncHandler(async (req, res) => {
  const institutionId = resolveInstitutionId(req);
  const book = await bookService.createBook(institutionId, {
    data: parseData(req.body),
    status: parseStatus(req.body.status),
    coverPath: req.file?.path ?? null,
    createdBy: req.user!.id,
  });
  res.status(201).json(new ApiResponse(201, book, "Book created"));
});

export const listBooks = asyncHandler(async (req, res) => {
  const query = listBooksSchema.parse(req.query);
  const result = await bookService.listBooks(resolveInstitutionId(req), query);
  res.status(200).json(new ApiResponse(200, result, "Books"));
});

export const getBook = asyncHandler(async (req, res) => {
  const result = await bookService.getBook(resolveInstitutionId(req), req.params.id as string);
  res.status(200).json(new ApiResponse(200, result, "Book"));
});

export const updateBook = asyncHandler(async (req, res) => {
  const hasData = req.body.data !== undefined;
  const book = await bookService.updateBook(resolveInstitutionId(req), req.params.id as string, {
    data: hasData ? parseData(req.body) : undefined,
    status: parseStatus(req.body.status),
    coverPath: req.file?.path ?? null,
  });
  res.status(200).json(new ApiResponse(200, book, "Book updated"));
});

export const deleteBook = asyncHandler(async (req, res) => {
  await bookService.deleteBook(resolveInstitutionId(req), req.params.id as string);
  res.status(200).json(new ApiResponse(200, null, "Book deleted"));
});
