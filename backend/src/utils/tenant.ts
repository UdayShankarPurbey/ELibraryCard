import type { Request } from "express";
import { ApiError } from "./ApiError.js";

// Tenant users always act within their own institution. A super admin has no
// institution of their own, so they must target one explicitly via ?institutionId=.
export const resolveInstitutionId = (req: Request): string => {
  if (req.user?.isSuperAdmin) {
    const id = req.query.institutionId;
    if (typeof id !== "string" || !id) {
      throw new ApiError(400, "institutionId query param is required for super admin");
    }
    return id;
  }
  if (!req.user?.institution) throw new ApiError(403, "No institution context");
  return req.user.institution.toString();
};
