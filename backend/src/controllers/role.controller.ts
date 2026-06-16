import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { resolveInstitutionId } from "../utils/tenant.js";
import * as roleService from "../services/role.service.js";

export const listRoles = asyncHandler(async (req, res) => {
  const items = await roleService.listRoles(resolveInstitutionId(req));
  res.status(200).json(new ApiResponse(200, items, "Roles"));
});

export const createRole = asyncHandler(async (req, res) => {
  const role = await roleService.createRole(resolveInstitutionId(req), req.body);
  res.status(201).json(new ApiResponse(201, role, "Role created"));
});

export const getRole = asyncHandler(async (req, res) => {
  const role = await roleService.getRole(resolveInstitutionId(req), req.params.id as string);
  res.status(200).json(new ApiResponse(200, role, "Role"));
});

export const updateRole = asyncHandler(async (req, res) => {
  const role = await roleService.updateRole(
    resolveInstitutionId(req),
    req.params.id as string,
    req.body,
  );
  res.status(200).json(new ApiResponse(200, role, "Role updated"));
});

export const deleteRole = asyncHandler(async (req, res) => {
  await roleService.deleteRole(resolveInstitutionId(req), req.params.id as string);
  res.status(200).json(new ApiResponse(200, null, "Role deleted"));
});
