import { Role } from "../models/role.model.js";
import { Permission } from "../models/permission.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { cacheDel } from "../config/redis.js";
import { CACHE_KEYS } from "../utils/constants.js";
import type { CreateRoleInput, UpdateRoleInput } from "../validators/role.validator.js";

const validatePermissions = async (institutionId: string, keys: string[]) => {
  if (!keys.length) return;
  const unique = [...new Set(keys)];
  const found = await Permission.find({ institution: institutionId, key: { $in: unique } }).select(
    "key",
  );
  const have = new Set(found.map((p) => p.key));
  const invalid = unique.filter((k) => !have.has(k));
  if (invalid.length) {
    throw new ApiError(400, `Unknown permissions for this institution: ${invalid.join(", ")}`);
  }
};

const invalidateRoleUsersCache = async (roleId: string) => {
  const users = await User.find({ roles: roleId }).select("_id");
  await Promise.all(
    users.map((u) => cacheDel(CACHE_KEYS.userPermissions(String(u._id))).catch(() => {})),
  );
};

export const listRoles = async (institutionId: string) =>
  Role.find({ institution: institutionId }).sort({ name: 1 });

export const createRole = async (institutionId: string, input: CreateRoleInput) => {
  await validatePermissions(institutionId, input.permissions);
  return Role.create({
    institution: institutionId,
    name: input.name,
    description: input.description,
    permissions: [...new Set(input.permissions)],
  });
};

export const getRole = async (institutionId: string, id: string) => {
  const role = await Role.findOne({ _id: id, institution: institutionId });
  if (!role) throw new ApiError(404, "Role not found");
  return role;
};

export const updateRole = async (institutionId: string, id: string, input: UpdateRoleInput) => {
  const role = await Role.findOne({ _id: id, institution: institutionId });
  if (!role) throw new ApiError(404, "Role not found");
  if (role.isSystem) throw new ApiError(403, "System roles cannot be modified");

  if (input.name !== undefined) role.name = input.name;
  if (input.description !== undefined) role.description = input.description;
  if (input.permissions !== undefined) {
    await validatePermissions(institutionId, input.permissions);
    role.permissions = [...new Set(input.permissions)];
  }

  await role.save();
  await invalidateRoleUsersCache(id);
  return role;
};

export const deleteRole = async (institutionId: string, id: string) => {
  const role = await Role.findOne({ _id: id, institution: institutionId });
  if (!role) throw new ApiError(404, "Role not found");
  if (role.isSystem) throw new ApiError(403, "System roles cannot be deleted");

  await User.updateMany({ institution: institutionId }, { $pull: { roles: role._id } });
  await invalidateRoleUsersCache(id);
  await role.deleteOne();
};
