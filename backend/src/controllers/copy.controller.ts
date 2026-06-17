import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { resolveInstitutionId } from "../utils/tenant.js";
import * as copyService from "../services/copy.service.js";
import type { CreateCopyInput } from "../validators/book.validator.js";

export const listCopies = asyncHandler(async (req, res) => {
  const copies = await copyService.listCopies(
    resolveInstitutionId(req),
    req.params.bookId as string,
  );
  res.status(200).json(new ApiResponse(200, copies, "Copies"));
});

export const addCopies = asyncHandler(async (req, res) => {
  const body = req.body as CreateCopyInput;
  const institutionId = resolveInstitutionId(req);
  const bookId = req.params.bookId as string;
  const copies = body.quantity
    ? await copyService.addCopiesByQuantity(institutionId, bookId, body.quantity)
    : await copyService.addCopies(institutionId, bookId, body.barcodes ?? [body.barcode as string]);
  res.status(201).json(new ApiResponse(201, copies, "Copies added"));
});

export const updateCopyStatus = asyncHandler(async (req, res) => {
  const copy = await copyService.updateCopyStatus(
    resolveInstitutionId(req),
    req.params.bookId as string,
    req.params.copyId as string,
    req.body.status,
  );
  res.status(200).json(new ApiResponse(200, copy, "Copy updated"));
});

export const deleteCopy = asyncHandler(async (req, res) => {
  await copyService.deleteCopy(
    resolveInstitutionId(req),
    req.params.bookId as string,
    req.params.copyId as string,
  );
  res.status(200).json(new ApiResponse(200, null, "Copy deleted"));
});
