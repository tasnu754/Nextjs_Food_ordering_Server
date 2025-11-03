import { Router, urlencoded } from "express";
import {
  getAllUsers,
  deleteUser,
  makeAdmin,
  removeAdmin,
} from "../controllers/user.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.use(urlencoded({ extended: true }));

router.get("/allUsers", authenticate, requireAdmin, getAllUsers);
router.delete("/delete/:userId", authenticate, requireAdmin, deleteUser);
router.patch("/make-admin/:userId", authenticate, requireAdmin, makeAdmin);
router.patch("/remove-admin/:userId", authenticate, requireAdmin, removeAdmin);

export default router;
