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
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getCart);

router.post("/add", addToCart);

router.patch("/update/:itemId", updateCartItem);

router.delete("/remove/:itemId", removeFromCart);

router.delete("/clear", clearCart);

router.patch("/increment/:itemId", incrementCartItem);

router.patch("/decrement/:itemId", decrementCartItem);

export default router;
