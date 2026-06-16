import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { resolveInstitutionId } from "../utils/tenant.js";
import * as circulationService from "../services/circulation.service.js";
import { listIssuesSchema } from "../validators/circulation.validator.js";

export const issueBook = asyncHandler(async (req, res) => {
  const issue = await circulationService.issueBook(
    resolveInstitutionId(req),
    req.body,
    req.user!.id,
  );
  res.status(201).json(new ApiResponse(201, issue, "Book issued"));
});

export const returnBook = asyncHandler(async (req, res) => {
  const issue = await circulationService.returnBook(resolveInstitutionId(req), req.body);
  res.status(200).json(new ApiResponse(200, issue, "Book returned"));
});

export const markLost = asyncHandler(async (req, res) => {
  const issue = await circulationService.markLost(
    resolveInstitutionId(req),
    req.params.issueId as string,
  );
  res.status(200).json(new ApiResponse(200, issue, "Issue marked lost"));
});

export const listIssues = asyncHandler(async (req, res) => {
  const query = listIssuesSchema.parse(req.query);
  const result = await circulationService.listIssues(resolveInstitutionId(req), query);
  res.status(200).json(new ApiResponse(200, result, "Issues"));
});

export const myIssues = asyncHandler(async (req, res) => {
  const items = await circulationService.listMyIssues(req.user!.id);
  res.status(200).json(new ApiResponse(200, items, "My issues"));
});
