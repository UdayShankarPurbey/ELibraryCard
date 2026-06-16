import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { resolveInstitutionId } from "../utils/tenant.js";
import * as userService from "../services/user.service.js";
import { listUsersSchema } from "../validators/user.validator.js";

export const listUsers = asyncHandler(async (req, res) => {
  const query = listUsersSchema.parse(req.query);
  const result = await userService.listUsers(resolveInstitutionId(req), query);
  res.status(200).json(new ApiResponse(200, result, "Users"));
});

export const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(resolveInstitutionId(req), req.body);
  res.status(201).json(new ApiResponse(201, user, "User created"));
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUser(resolveInstitutionId(req), req.params.id as string);
  res.status(200).json(new ApiResponse(200, user, "User"));
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(
    resolveInstitutionId(req),
    req.params.id as string,
    req.body,
  );
  res.status(200).json(new ApiResponse(200, user, "User updated"));
});

export const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(resolveInstitutionId(req), req.params.id as string);
  res.status(200).json(new ApiResponse(200, null, "User deleted"));
});

export const resetPassword = asyncHandler(async (req, res) => {
  await userService.resetPassword(
    resolveInstitutionId(req),
    req.params.id as string,
    req.body.newPassword,
  );
  res.status(200).json(new ApiResponse(200, null, "Password reset"));
});
