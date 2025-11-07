import { Router } from "express";
import {
  getUserProfile,
  getAllUsers,
  deleteUser,
  makeAdmin,
  removeAdmin,
  updateProfile,
} from "../controllers/user.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { uploadProfile } from "../config/cloudinary.js";

const router = Router();

router.get("/profile/:userId", getUserProfile);
router.get("/allUsers", authenticate, authorize, getAllUsers);
router.delete("/delete/:userId", authenticate, authorize, deleteUser);
router.patch("/make-admin/:userId", authenticate, authorize, makeAdmin);
router.patch("/remove-admin/:userId", authenticate, authorize, removeAdmin);
router.patch(
  "/profile",
  authenticate,
  (req, res, next) => {
    uploadProfile.single("profileImage")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: "File upload error",
          error: err.message,
        });
      }
      next();
    });
  },
  updateProfile
);

export default router;
