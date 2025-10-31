import { Router, urlencoded } from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";
const router = Router();

router.use(urlencoded({ extended: true }));

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);
router.post("/logout", authenticate, logoutUser);

export default router;
