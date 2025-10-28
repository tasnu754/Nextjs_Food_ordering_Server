import { Router, urlencoded } from "express";
import { getAllUsers } from "../controllers/user.controller.js";

const router = Router();

router.use(urlencoded({ extended: true }));

router.get("/allUsers", getAllUsers);

export default router;
