import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  bootstrapSchema,
  loginSchema,
  changePasswordSchema,
} from "../validators/auth.validator.js";

const router = Router();

router.post(
  "/bootstrap-super-admin",
  validate(bootstrapSchema),
  authController.bootstrapSuperAdmin,
);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", verifyJWT, authController.logout);
router.get("/me", verifyJWT, authController.me);
router.post(
  "/change-password",
  verifyJWT,
  validate(changePasswordSchema),
  authController.changePassword,
);

export { router as authRouter };
