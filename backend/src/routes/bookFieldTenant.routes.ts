import { Router } from "express";
import * as bookFieldController from "../controllers/bookField.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createBookFieldSchema,
  updateBookFieldSchema,
  reorderBookFieldsSchema,
} from "../validators/bookField.validator.js";

const router = Router();

router.use(verifyJWT);

router.get("/", requirePermission("book.view"), bookFieldController.listMyFields);
router.post(
  "/",
  requirePermission("bookfield.manage"),
  validate(createBookFieldSchema),
  bookFieldController.createMyField,
);
router.patch(
  "/reorder",
  requirePermission("bookfield.manage"),
  validate(reorderBookFieldsSchema),
  bookFieldController.reorderMyFields,
);
router.patch(
  "/:fieldId",
  requirePermission("bookfield.manage"),
  validate(updateBookFieldSchema),
  bookFieldController.updateMyField,
);
router.delete(
  "/:fieldId",
  requirePermission("bookfield.manage"),
  bookFieldController.deleteMyField,
);

export { router as bookFieldTenantRouter };
