import express from "express";
import {
  addReview,
  updateReview,
  deleteReview,
  getUserReview,
  canUserReview,
} from "../controllers/review.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Add review to food item
router.post("/:foodItemId", addReview);

// Get user's review for a food item
router.get("/:foodItemId/user-review", getUserReview);

// Check if user can review
router.get("/:foodItemId/can-review", canUserReview);

// Update review
router.patch("/:foodItemId/:reviewId", updateReview);

// Delete review (user can delete own, admin can delete any)
router.delete("/:foodItemId/:reviewId", deleteReview);

export default router;
