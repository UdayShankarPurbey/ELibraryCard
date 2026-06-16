import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
});

export const updateRoleSchema = z
  .object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    permissions: z.array(z.string()).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: "No fields to update" });

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
