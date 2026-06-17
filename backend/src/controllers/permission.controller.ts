import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { resolveInstitutionId } from "../utils/tenant.js";
import * as permissionService from "../services/permission.service.js";
import { listPermissionsSchema } from "../validators/permission.validator.js";

export const listPermissions = asyncHandler(async (req, res) => {
  const { group } = listPermissionsSchema.parse(req.query);
  const items = await permissionService.listPermissions(req.params.institutionId as string, group);
  res.status(200).json(new ApiResponse(200, items, "Permissions"));
});

export const listMyPermissions = asyncHandler(async (req, res) => {
  const { group } = listPermissionsSchema.parse(req.query);
  const items = await permissionService.listPermissions(resolveInstitutionId(req), group);
  res.status(200).json(new ApiResponse(200, items, "Permissions"));
});

export const createPermission = asyncHandler(async (req, res) => {
  const permission = await permissionService.createPermission(
    req.params.institutionId as string,
    req.body,
  );
  res.status(201).json(new ApiResponse(201, permission, "Permission created"));
});

export const seedDefaults = asyncHandler(async (req, res) => {
  const result = await permissionService.seedDefaultPermissions(req.params.institutionId as string);
  res.status(200).json(new ApiResponse(200, result, "Default permissions seeded"));
});

export const updatePermission = asyncHandler(async (req, res) => {
  const permission = await permissionService.updatePermission(
    req.params.institutionId as string,
    req.params.permissionId as string,
    req.body,
  );
  res.status(200).json(new ApiResponse(200, permission, "Permission updated"));
});

export const deletePermission = asyncHandler(async (req, res) => {
  await permissionService.deletePermission(
    req.params.institutionId as string,
    req.params.permissionId as string,
  );
  res.status(200).json(new ApiResponse(200, null, "Permission deleted"));
});
