import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";

export const requireSuperAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user?.isSuperAdmin) throw new ApiError(403, "Super admin access required");
  next();
};

export const requirePermission =
  (...required: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (req.user?.isSuperAdmin) return next();
    const held = new Set(req.user?.permissions || []);
    const missing = required.filter((key) => !held.has(key));
    if (missing.length) {
      throw new ApiError(403, `Missing permission: ${missing.join(", ")}`);
    }
    next();
  };

export const requireAnyPermission =
  (...accepted: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (req.user?.isSuperAdmin) return next();
    const held = new Set(req.user?.permissions || []);
    if (accepted.some((key) => held.has(key))) return next();
    throw new ApiError(403, `Requires one of: ${accepted.join(", ")}`);
  };

export const requireInstitution = (req: Request, _res: Response, next: NextFunction) => {
  if (req.user?.isSuperAdmin) return next();
  if (!req.user?.institution) throw new ApiError(403, "No institution context");
  next();
};
