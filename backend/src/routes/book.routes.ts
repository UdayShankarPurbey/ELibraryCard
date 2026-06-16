import { Router } from "express";
import * as bookController from "../controllers/book.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/rbac.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT);

router.get("/", requirePermission("book.view"), bookController.listBooks);
router.get("/:id", requirePermission("book.view"), bookController.getBook);
router.post(
  "/",
  requirePermission("book.create"),
  upload.single("cover"),
  bookController.createBook,
);
router.patch(
  "/:id",
  requirePermission("book.update"),
  upload.single("cover"),
  bookController.updateBook,
);
router.delete("/:id", requirePermission("book.delete"), bookController.deleteBook);

export { router as bookRouter };
