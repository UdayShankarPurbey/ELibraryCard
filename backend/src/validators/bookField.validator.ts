import { z } from "zod";
import { FIELD_DATA_TYPES } from "../utils/constants.js";

const fieldKey = z
  .string()
  .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, "Field key must start with a letter (letters, numbers, _)");

const enumNeedsOptions = (d: { dataType?: string; options?: string[] }) =>
  d.dataType !== "enum" || (Array.isArray(d.options) && d.options.length > 0);

export const createBookFieldSchema = z
  .object({
    fieldKey,
    label: z.string().min(1),
    dataType: z.enum(FIELD_DATA_TYPES),
    isRequired: z.boolean().optional(),
    options: z.array(z.string().min(1)).optional(),
    sortOrder: z.number().int().optional(),
  })
  .refine(enumNeedsOptions, {
    message: "Enum fields require at least one option",
    path: ["options"],
  });

export const updateBookFieldSchema = z
  .object({
    label: z.string().min(1).optional(),
    dataType: z.enum(FIELD_DATA_TYPES).optional(),
    isRequired: z.boolean().optional(),
    options: z.array(z.string().min(1)).optional(),
    sortOrder: z.number().int().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: "No fields to update" })
  .refine(enumNeedsOptions, {
    message: "Enum fields require at least one option",
    path: ["options"],
  });

export const reorderBookFieldsSchema = z.object({
  order: z.array(z.string().min(1)).min(1),
});

export type CreateBookFieldInput = z.infer<typeof createBookFieldSchema>;
export type UpdateBookFieldInput = z.infer<typeof updateBookFieldSchema>;
export type ReorderBookFieldsInput = z.infer<typeof reorderBookFieldsSchema>;
