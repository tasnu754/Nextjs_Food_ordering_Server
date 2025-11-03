import { Router } from "express";

import {
  addCategory,
  getAllCategories,
} from "../controllers/category.controller.js";

const router = Router();

router.get("/", getAllCategories);

router.post("/", addCategory);

export default router;
