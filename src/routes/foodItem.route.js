import { Router } from "express";
import {
  createFoodItem,
  getAllFoodItems,
  getSingleFoodItem,
  deleteFoodItem,
  updateFoodItem,
} from "../controllers/foodItem.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { uploadFood } from "../config/cloudinary.js";

const router = Router();

router.get("/", getAllFoodItems);
router.get("/:id", authenticate, getSingleFoodItem);

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

router.put(
  "/:id",
  authenticate,
  authorize,
  uploadFood.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "additionalImages", maxCount: 5 },
  ]),
  updateFoodItem
);

router.delete("/:id", authenticate, authorize, deleteFoodItem);

export default router;
