import { Router } from "express";
import {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/profile", authenticate, async (req, res) => {
  res.json({
    ok: true,
    data: {
      user: req.user,
      message: "This is a protected route",
    },
  });
});

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);
router.post("/logout", authenticate, logoutUser);

export default router;
