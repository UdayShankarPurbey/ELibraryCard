import bcrypt from "bcrypt";
import { User, type IUser } from "../models/user.model.js";
import { Role } from "../models/role.model.js";
import { ApiError } from "../utils/ApiError.js";
import { cacheDel } from "../config/redis.js";
import { CACHE_KEYS } from "../utils/constants.js";
import type {
  CreateUserInput,
  UpdateUserInput,
  ListUsersQuery,
} from "../validators/user.validator.js";

const toDTO = (user: IUser) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  status: user.status,
  isSuperAdmin: user.isSuperAdmin,
  institution: user.institution,
  roles: user.roles,
  createdAt: user.createdAt,
});

const validateRoles = async (institutionId: string, roleIds: string[]) => {
  if (!roleIds.length) return;
  const unique = [...new Set(roleIds)];
  const count = await Role.countDocuments({ _id: { $in: unique }, institution: institutionId });
  if (count !== unique.length) {
    throw new ApiError(400, "One or more roles do not belong to this institution");
  }
};

export const listUsers = async (institutionId: string, q: ListUsersQuery) => {
  const page = q.page ?? 1;
  const limit = q.limit ?? 20;
  const filter: Record<string, unknown> = { institution: institutionId };
  if (q.status) filter.status = q.status;
  if (q.roleId) filter.roles = q.roleId;
  if (q.search) {
    filter.$or = [
      { fullName: { $regex: q.search, $options: "i" } },
      { email: { $regex: q.search, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .populate("roles", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);
  return { items, total, page, limit };
};

export const createUser = async (institutionId: string, input: CreateUserInput) => {
  await validateRoles(institutionId, input.roleIds);
  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await User.create({
    institution: institutionId,
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    passwordHash,
    roles: [...new Set(input.roleIds)],
    status: input.status ?? "active",
    isSuperAdmin: false,
  });
  return toDTO(user);
};

export const getUser = async (institutionId: string, id: string) => {
  const user = await User.findOne({ _id: id, institution: institutionId }).populate(
    "roles",
    "name permissions",
  );
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

export const updateUser = async (institutionId: string, id: string, input: UpdateUserInput) => {
  const user = await User.findOne({ _id: id, institution: institutionId });
  if (!user) throw new ApiError(404, "User not found");

  if (input.fullName !== undefined) user.fullName = input.fullName;
  if (input.email !== undefined) user.email = input.email;
  if (input.phone !== undefined) user.phone = input.phone;
  if (input.status !== undefined) user.status = input.status;
  if (input.roleIds !== undefined) {
    await validateRoles(institutionId, input.roleIds);
    user.roles = [...new Set(input.roleIds)] as unknown as IUser["roles"];
  }

  await user.save();
  await cacheDel(CACHE_KEYS.userPermissions(id)).catch(() => {});
  return toDTO(user);
};

export const deleteUser = async (institutionId: string, id: string) => {
  const user = await User.findOneAndDelete({ _id: id, institution: institutionId });
  if (!user) throw new ApiError(404, "User not found");
  await cacheDel(CACHE_KEYS.userPermissions(id)).catch(() => {});
};

export const resetPassword = async (institutionId: string, id: string, newPassword: string) => {
  const user = await User.findOne({ _id: id, institution: institutionId });
  if (!user) throw new ApiError(404, "User not found");
  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.refreshTokenHash = undefined;
  await user.save({ validateBeforeSave: false });
};
