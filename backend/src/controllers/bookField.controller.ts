import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { resolveInstitutionId } from "../utils/tenant.js";
import * as bookFieldService from "../services/bookField.service.js";

export const listFields = asyncHandler(async (req, res) => {
  const items = await bookFieldService.listFields(req.params.institutionId as string);
  res.status(200).json(new ApiResponse(200, items, "Book fields"));
});

export const listMyFields = asyncHandler(async (req, res) => {
  const items = await bookFieldService.listFields(resolveInstitutionId(req));
  res.status(200).json(new ApiResponse(200, items, "Book fields"));
});

export const createMyField = asyncHandler(async (req, res) => {
  const field = await bookFieldService.createField(resolveInstitutionId(req), req.body);
  res.status(201).json(new ApiResponse(201, field, "Book field created"));
});

export const updateMyField = asyncHandler(async (req, res) => {
  const field = await bookFieldService.updateField(
    resolveInstitutionId(req),
    req.params.fieldId as string,
    req.body,
  );
  res.status(200).json(new ApiResponse(200, field, "Book field updated"));
});

export const deleteMyField = asyncHandler(async (req, res) => {
  await bookFieldService.deleteField(resolveInstitutionId(req), req.params.fieldId as string);
  res.status(200).json(new ApiResponse(200, null, "Book field deleted"));
});

export const reorderMyFields = asyncHandler(async (req, res) => {
  const items = await bookFieldService.reorderFields(resolveInstitutionId(req), req.body);
  res.status(200).json(new ApiResponse(200, items, "Book fields reordered"));
});

export const createField = asyncHandler(async (req, res) => {
  const field = await bookFieldService.createField(req.params.institutionId as string, req.body);
  res.status(201).json(new ApiResponse(201, field, "Book field created"));
});

export const updateField = asyncHandler(async (req, res) => {
  const field = await bookFieldService.updateField(
    req.params.institutionId as string,
    req.params.fieldId as string,
    req.body,
  );
  res.status(200).json(new ApiResponse(200, field, "Book field updated"));
});

export const deleteField = asyncHandler(async (req, res) => {
  await bookFieldService.deleteField(
    req.params.institutionId as string,
    req.params.fieldId as string,
  );
  res.status(200).json(new ApiResponse(200, null, "Book field deleted"));
});

export const reorderFields = asyncHandler(async (req, res) => {
  const items = await bookFieldService.reorderFields(req.params.institutionId as string, req.body);
  res.status(200).json(new ApiResponse(200, items, "Book fields reordered"));
});
