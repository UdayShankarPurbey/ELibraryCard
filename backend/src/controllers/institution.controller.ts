import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as institutionService from "../services/institution.service.js";
import { listInstitutionsSchema } from "../validators/institution.validator.js";

export const createInstitution = asyncHandler(async (req, res) => {
  const institution = await institutionService.createInstitution(req.body);
  res.status(201).json(new ApiResponse(201, institution, "Institution created"));
});

export const listInstitutions = asyncHandler(async (req, res) => {
  const query = listInstitutionsSchema.parse(req.query);
  const result = await institutionService.listInstitutions(query);
  res.status(200).json(new ApiResponse(200, result, "Institutions"));
});

export const getInstitution = asyncHandler(async (req, res) => {
  const institution = await institutionService.getInstitution(req.params.id as string);
  res.status(200).json(new ApiResponse(200, institution, "Institution"));
});

export const updateInstitution = asyncHandler(async (req, res) => {
  const institution = await institutionService.updateInstitution(req.params.id as string, req.body);
  res.status(200).json(new ApiResponse(200, institution, "Institution updated"));
});

export const deleteInstitution = asyncHandler(async (req, res) => {
  await institutionService.deleteInstitution(req.params.id as string);
  res.status(200).json(new ApiResponse(200, null, "Institution deleted"));
});
