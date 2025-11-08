import express from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  getOrderStatistics,
} from "../controllers/order.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// User routes
router.post("/", authenticate, createOrder);
router.get("/my-orders", authenticate, getUserOrders);
router.get("/:orderId", authenticate, getOrderById);
router.patch("/:orderId/cancel", authenticate, cancelOrder);

// Admin routes
router.get("/admin/all", authenticate, authorize, getAllOrders);
router.get(
  "/authorize/statistics",
  authenticate,
  authorize,
  getOrderStatistics
);
router.patch("/:orderId/status", authenticate, authorize, updateOrderStatus);
router.patch("/:orderId/payment", authenticate, authorize, updatePaymentStatus);

export default router;
