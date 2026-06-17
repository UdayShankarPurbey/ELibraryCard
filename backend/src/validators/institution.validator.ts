import { z } from "zod";

const slug = z
  .string()
  .regex(/^[a-z0-9-]+$/, "Slug may contain lowercase letters, numbers and hyphens");

export const createInstitutionSchema = z.object({
  name: z.string().min(2),
  slug: slug.optional(),
  status: z.enum(["active", "suspended"]).optional(),
  seedPermissions: z.boolean().optional(),
  seedBookFields: z.boolean().optional(),
});

export const updateInstitutionSchema = z
  .object({
    name: z.string().min(2).optional(),
    slug: slug.optional(),
    status: z.enum(["active", "suspended"]).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: "No fields to update" });

export const listInstitutionsSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: z.enum(["active", "suspended"]).optional(),
  search: z.string().optional(),
});

export type CreateInstitutionInput = z.infer<typeof createInstitutionSchema>;
export type UpdateInstitutionInput = z.infer<typeof updateInstitutionSchema>;
export type ListInstitutionsQuery = z.infer<typeof listInstitutionsSchema>;
