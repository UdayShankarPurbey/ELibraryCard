import { Router } from "express";
import * as permissionController from "../controllers/permission.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireSuperAdmin } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createPermissionSchema,
  updatePermissionSchema,
} from "../validators/permission.validator.js";

const router = Router({ mergeParams: true });

router.use(verifyJWT, requireSuperAdmin);

router.get("/", permissionController.listPermissions);
router.post("/", validate(createPermissionSchema), permissionController.createPermission);
router.post("/seed-defaults", permissionController.seedDefaults);
router.patch(
  "/:permissionId",
  validate(updatePermissionSchema),
  permissionController.updatePermission,
);
router.delete("/:permissionId", permissionController.deletePermission);

export { router as permissionRouter };
