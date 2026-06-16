import { Router } from "express";
import * as roleController from "../controllers/role.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requirePermission, requireAnyPermission } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createRoleSchema, updateRoleSchema } from "../validators/role.validator.js";

const router = Router();

router.use(verifyJWT);

// Listing is readable by user managers too (to assign roles); writes stay role.manage.
router.get(
  "/",
  requireAnyPermission("role.manage", "role.view", "user.manage"),
  roleController.listRoles,
);
router.post(
  "/",
  requirePermission("role.manage"),
  validate(createRoleSchema),
  roleController.createRole,
);
router.get("/:id", requirePermission("role.manage"), roleController.getRole);
router.patch(
  "/:id",
  requirePermission("role.manage"),
  validate(updateRoleSchema),
  roleController.updateRole,
);
router.delete("/:id", requirePermission("role.manage"), roleController.deleteRole);

export { router as roleRouter };
