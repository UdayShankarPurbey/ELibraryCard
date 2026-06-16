import { z } from "zod";

export const createUserSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  roleIds: z.array(z.string()).default([]),
  status: z.enum(["active", "inactive"]).optional(),
});

export const updateUserSchema = z
  .object({
    fullName: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    roleIds: z.array(z.string()).optional(),
    status: z.enum(["active", "inactive"]).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: "No fields to update" });

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8),
});

export const listUsersSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  roleId: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersSchema>;
