import express from "express";
import {
  addCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { uploadCategory } from "../config/cloudinary.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize,
  uploadCategory.single("image"),
  addCategory
);
router.get("/", getAllCategories);
router.put(
  "/:id",
  authenticate,
  authorize,
  uploadCategory.single("image"),
  updateCategory
);
router.delete("/:id", authenticate, authorize, deleteCategory);

export default router;
