import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlistItem,
  clearWishlist,
  checkWishlistItem,
} from "../controllers/wishlist.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getWishlist);

router.post("/add", addToWishlist);

router.post("/toggle", toggleWishlistItem);

router.delete("/remove/:foodItemId", removeFromWishlist);

router.delete("/clear", clearWishlist);

router.get("/check/:foodItemId", checkWishlistItem);

export default router;
