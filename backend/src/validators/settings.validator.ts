import { z } from "zod";

export const updateSettingsSchema = z.object({
  barcodePrefix: z
    .string()
    .trim()
    .max(32)
    .regex(/^[A-Za-z0-9-]*$/, "Prefix may contain letters, numbers and hyphens"),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
