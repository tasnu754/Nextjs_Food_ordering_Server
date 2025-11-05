import { Router } from "express";
import { createFoodItem } from "../controllers/foodItem.controller.js";
import { uploadFood } from "../config/cloudinary.js";

const router = Router();

router.post(
  "/",
  uploadFood.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "additionalImages", maxCount: 5 },
  ]),
  createFoodItem
);

export default router;
