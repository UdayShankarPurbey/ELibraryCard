import { z } from "zod";

const key = z.string().regex(/^[a-z][a-z0-9._-]*$/, "Key must be lowercase, e.g. book.create");

export const createPermissionSchema = z.object({
  key,
  label: z.string().min(1),
  group: z.string().min(1).optional(),
  description: z.string().optional(),
});

export const updatePermissionSchema = z
  .object({
    label: z.string().min(1).optional(),
    group: z.string().min(1).optional(),
    description: z.string().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: "No fields to update" });

export const listPermissionsSchema = z.object({
  group: z.string().optional(),
});

export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>;
