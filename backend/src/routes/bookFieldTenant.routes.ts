import { Router } from "express";
import * as bookFieldController from "../controllers/bookField.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/rbac.middleware.js";

// Tenant read access to the institution's own book-field schema (form/table rendering).
const router = Router();

router.use(verifyJWT, requirePermission("book.view"));
router.get("/", bookFieldController.listMyFields);

export { router as bookFieldTenantRouter };
