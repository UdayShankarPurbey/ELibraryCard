import { z } from "zod";

export const issueSchema = z.object({
  bookCopyId: z.string().min(1),
  memberId: z.string().min(1),
  dueAt: z.string().optional(),
  loanDays: z.coerce.number().int().min(1).max(365).optional(),
});

export const returnSchema = z
  .object({
    issueId: z.string().optional(),
    bookCopyId: z.string().optional(),
  })
  .refine((d) => Boolean(d.issueId || d.bookCopyId), {
    message: "Provide issueId or bookCopyId",
  });

export const listIssuesSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: z.enum(["issued", "returned", "overdue", "lost"]).optional(),
  memberId: z.string().optional(),
  overdue: z.enum(["true", "false"]).optional(),
});

export type IssueInput = z.infer<typeof issueSchema>;
export type ReturnInput = z.infer<typeof returnSchema>;
export type ListIssuesQuery = z.infer<typeof listIssuesSchema>;
