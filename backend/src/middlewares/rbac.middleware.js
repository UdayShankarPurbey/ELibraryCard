import { ApiError } from "../utils/ApiError.js";

export const requireSuperAdmin = (req, _res, next) => {
  if (!req.user?.isSuperAdmin) throw new ApiError(403, "Super admin access required");
  next();
};

// Passes if the user is a super admin or holds every required permission key.
export const requirePermission = (...required) => (req, _res, next) => {
  if (req.user?.isSuperAdmin) return next();
  const held = new Set(req.user?.permissions || []);
  const missing = required.filter((key) => !held.has(key));
  if (missing.length) {
    throw new ApiError(403, `Missing permission: ${missing.join(", ")}`);
  }
  next();
};

// Ensures the caller acts within their own tenant (super admin is exempt).
export const requireInstitution = (req, _res, next) => {
  if (req.user?.isSuperAdmin) return next();
  if (!req.user?.institution) throw new ApiError(403, "No institution context");
  next();
};
