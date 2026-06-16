import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requirePermission, requireAnyPermission } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
} from "../validators/user.validator.js";

const router = Router();

router.use(verifyJWT);

router.get("/", requireAnyPermission("user.view", "user.manage"), userController.listUsers);
router.get("/:id", requireAnyPermission("user.view", "user.manage"), userController.getUser);
router.post(
  "/",
  requirePermission("user.manage"),
  validate(createUserSchema),
  userController.createUser,
);
router.patch(
  "/:id",
  requirePermission("user.manage"),
  validate(updateUserSchema),
  userController.updateUser,
);
router.delete("/:id", requirePermission("user.manage"), userController.deleteUser);
router.post(
  "/:id/reset-password",
  requirePermission("user.manage"),
  validate(resetPasswordSchema),
  userController.resetPassword,
);

export { router as userRouter };
