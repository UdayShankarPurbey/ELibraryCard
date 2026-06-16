import { Router } from "express";
import * as bookFieldController from "../controllers/bookField.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireSuperAdmin } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createBookFieldSchema,
  updateBookFieldSchema,
  reorderBookFieldsSchema,
} from "../validators/bookField.validator.js";

const router = Router({ mergeParams: true });

router.use(verifyJWT, requireSuperAdmin);

router.get("/", bookFieldController.listFields);
router.post("/", validate(createBookFieldSchema), bookFieldController.createField);
router.patch("/reorder", validate(reorderBookFieldsSchema), bookFieldController.reorderFields);
router.patch("/:fieldId", validate(updateBookFieldSchema), bookFieldController.updateField);
router.delete("/:fieldId", bookFieldController.deleteField);

export { router as bookFieldRouter };
