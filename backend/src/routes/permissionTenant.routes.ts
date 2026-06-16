import { Router } from "express";
import * as permissionController from "../controllers/permission.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireAnyPermission } from "../middlewares/rbac.middleware.js";

// Tenant read access to the institution's permission catalog (role-builder UI).
const router = Router();

router.use(verifyJWT, requireAnyPermission("role.manage", "role.view"));
router.get("/", permissionController.listMyPermissions);

export { router as permissionTenantRouter };
