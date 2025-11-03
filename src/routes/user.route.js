import { Router } from "express";
import {
  getAllUsers,
  deleteUser,
  makeAdmin,
  removeAdmin,
} from "../controllers/user.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/allUsers", authenticate, authorize, getAllUsers);
router.delete("/delete/:userId", authenticate, authorize, deleteUser);
router.patch("/make-admin/:userId", authenticate, authorize, makeAdmin);
router.patch("/remove-admin/:userId", authenticate, authorize, removeAdmin);

export default router;
