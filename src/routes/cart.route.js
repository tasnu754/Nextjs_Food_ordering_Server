import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  incrementCartItem,
  decrementCartItem,
} from "../controllers/cart.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get cart
router.get("/", getCart);

// Add item to cart
router.post("/add", addToCart);

// Update item quantity
router.patch("/update/:itemId", updateCartItem);

// Remove item from cart
router.delete("/remove/:itemId", removeFromCart);

// Clear cart
router.delete("/clear", clearCart);

// Increment item quantity
router.patch("/increment/:itemId", incrementCartItem);

// Decrement item quantity
router.patch("/decrement/:itemId", decrementCartItem);

export default router;
