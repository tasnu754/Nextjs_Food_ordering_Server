import { Router } from "express";
import {
  createFoodItem,
  getAllFoodItems,
} from "../controllers/foodItem.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { uploadFood } from "../config/cloudinary.js";

const router = Router();

router.get("/", getAllFoodItems);

router.post(
  "/",
  authenticate,
  authorize,
  uploadFood.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "additionalImages", maxCount: 5 },
  ]),
  createFoodItem
);

export default router;
