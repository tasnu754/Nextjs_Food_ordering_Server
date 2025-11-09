import express from "express";
import {
  getAdminStats,
  getRecentActivities,
} from "../controllers/dashboard.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate, authorize);

router.get("/stats", getAdminStats);

router.get("/activities", getRecentActivities);

export default router;
