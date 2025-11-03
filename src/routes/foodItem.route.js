import { Router } from "express";
import { createFoodItem } from "../controllers/foodItem.controller.js";

const router = Router();

router.post("/", createFoodItem);

export default router;
