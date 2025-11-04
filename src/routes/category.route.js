import express from "express";
import {
  addCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

router.post("/", upload.single("image"), addCategory);
router.get("/", getAllCategories);
router.put("/:id", upload.single("image"), updateCategory);
router.delete("/:id", deleteCategory);

export default router;
