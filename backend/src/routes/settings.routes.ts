import { Router } from "express";
import * as settingsController from "../controllers/settings.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { updateSettingsSchema } from "../validators/settings.validator.js";

const router = Router();

router.use(verifyJWT);

router.get("/", settingsController.getSettings);
router.patch(
  "/",
  requirePermission("settings.manage"),
  validate(updateSettingsSchema),
  settingsController.updateSettings,
);

export { router as settingsRouter };
