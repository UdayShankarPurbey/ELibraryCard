import { z } from "zod";

export const bookStatusSchema = z.enum(["active", "archived"]);

export const listBooksSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: bookStatusSchema.optional(),
});

export const createCopySchema = z
  .object({
    barcode: z.string().min(1).optional(),
    barcodes: z.array(z.string().min(1)).optional(),
  })
  .refine((d) => Boolean(d.barcode) || (Array.isArray(d.barcodes) && d.barcodes.length > 0), {
    message: "Provide a barcode or a non-empty barcodes array",
  });

export const updateCopySchema = z.object({
  status: z.enum(["available", "lost", "damaged"]),
});

export type ListBooksQuery = z.infer<typeof listBooksSchema>;
export type CreateCopyInput = z.infer<typeof createCopySchema>;
export type UpdateCopyInput = z.infer<typeof updateCopySchema>;
