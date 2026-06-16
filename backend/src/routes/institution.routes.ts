import { Router } from "express";
import * as institutionController from "../controllers/institution.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireSuperAdmin } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createInstitutionSchema,
  updateInstitutionSchema,
} from "../validators/institution.validator.js";

const router = Router();

router.use(verifyJWT, requireSuperAdmin);

router.post("/", validate(createInstitutionSchema), institutionController.createInstitution);
router.get("/", institutionController.listInstitutions);
router.get("/:id", institutionController.getInstitution);
router.patch("/:id", validate(updateInstitutionSchema), institutionController.updateInstitution);
router.delete("/:id", institutionController.deleteInstitution);

export { router as institutionRouter };
