import { ApiError } from "../utils/ApiError.js";

export const requireSuperAdmin = (req, _res, next) => {
  if (!req.user?.isSuperAdmin) throw new ApiError(403, "Super admin access required");
  next();
};

export const requirePermission =
  (...required) =>
  (req, _res, next) => {
    if (req.user?.isSuperAdmin) return next();
    const held = new Set(req.user?.permissions || []);
    const missing = required.filter((key) => !held.has(key));
    if (missing.length) {
      throw new ApiError(403, `Missing permission: ${missing.join(", ")}`);
    }
    next();
  };

export const requireInstitution = (req, _res, next) => {
  if (req.user?.isSuperAdmin) return next();
  if (!req.user?.institution) throw new ApiError(403, "No institution context");
  next();
};
