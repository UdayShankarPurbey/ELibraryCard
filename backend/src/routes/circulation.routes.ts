import { Router } from "express";
import * as circulationController from "../controllers/circulation.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { issueSchema, returnSchema } from "../validators/circulation.validator.js";

const router = Router();

router.use(verifyJWT);

router.get("/my", circulationController.myIssues);
router.get("/", requirePermission("issue.view"), circulationController.listIssues);
router.post(
  "/issue",
  requirePermission("issue.create"),
  validate(issueSchema),
  circulationController.issueBook,
);
router.post(
  "/return",
  requirePermission("issue.return"),
  validate(returnSchema),
  circulationController.returnBook,
);
router.post("/:issueId/lost", requirePermission("issue.return"), circulationController.markLost);

export { router as circulationRouter };
