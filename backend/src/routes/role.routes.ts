import { Router } from "express";
import * as roleController from "../controllers/role.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createRoleSchema, updateRoleSchema } from "../validators/role.validator.js";

const router = Router();

router.use(verifyJWT, requirePermission("role.manage"));

router.get("/", roleController.listRoles);
router.post("/", validate(createRoleSchema), roleController.createRole);
router.get("/:id", roleController.getRole);
router.patch("/:id", validate(updateRoleSchema), roleController.updateRole);
router.delete("/:id", roleController.deleteRole);

export { router as roleRouter };
