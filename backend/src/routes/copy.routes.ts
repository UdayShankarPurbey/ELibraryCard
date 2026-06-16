import { Router } from "express";
import * as copyController from "../controllers/copy.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createCopySchema, updateCopySchema } from "../validators/book.validator.js";

const router = Router({ mergeParams: true });

router.use(verifyJWT);

router.get("/", requirePermission("book.view"), copyController.listCopies);
router.post(
  "/",
  requirePermission("copy.manage"),
  validate(createCopySchema),
  copyController.addCopies,
);
router.patch(
  "/:copyId",
  requirePermission("copy.manage"),
  validate(updateCopySchema),
  copyController.updateCopyStatus,
);
router.delete("/:copyId", requirePermission("copy.manage"), copyController.deleteCopy);

export { router as copyRouter };
