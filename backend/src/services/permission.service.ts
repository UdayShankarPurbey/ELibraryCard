import { Permission } from "../models/permission.model.js";
import { Institution } from "../models/institution.model.js";
import { Role } from "../models/role.model.js";
import { ApiError } from "../utils/ApiError.js";
import { DEFAULT_PERMISSION_TEMPLATE } from "../utils/constants.js";
import type {
  CreatePermissionInput,
  UpdatePermissionInput,
} from "../validators/permission.validator.js";

const assertInstitution = async (institutionId: string) => {
  const exists = await Institution.exists({ _id: institutionId });
  if (!exists) throw new ApiError(404, "Institution not found");
};

export const listPermissions = async (institutionId: string, group?: string) => {
  await assertInstitution(institutionId);
  const filter: Record<string, unknown> = { institution: institutionId };
  if (group) filter.group = group;
  return Permission.find(filter).sort({ group: 1, key: 1 });
};

export const createPermission = async (institutionId: string, input: CreatePermissionInput) => {
  await assertInstitution(institutionId);
  return Permission.create({ ...input, institution: institutionId });
};

export const seedDefaultPermissions = async (institutionId: string) => {
  await assertInstitution(institutionId);
  const existing = await Permission.find({ institution: institutionId }).select("key");
  const have = new Set(existing.map((p) => p.key));
  const toAdd = DEFAULT_PERMISSION_TEMPLATE.filter((p) => !have.has(p.key)).map((p) => ({
    ...p,
    institution: institutionId,
  }));
  if (toAdd.length) await Permission.insertMany(toAdd);
  return { added: toAdd.length };
};

export const updatePermission = async (
  institutionId: string,
  permissionId: string,
  input: UpdatePermissionInput,
) => {
  const permission = await Permission.findOneAndUpdate(
    { _id: permissionId, institution: institutionId },
    input,
    { new: true, runValidators: true },
  );
  if (!permission) throw new ApiError(404, "Permission not found");
  return permission;
};

export const deletePermission = async (institutionId: string, permissionId: string) => {
  const permission = await Permission.findOne({ _id: permissionId, institution: institutionId });
  if (!permission) throw new ApiError(404, "Permission not found");
  await Role.updateMany({ institution: institutionId }, { $pull: { permissions: permission.key } });
  await permission.deleteOne();
};
