import { Router } from "express";

import { addCategory } from "../controllers/category.controller.js";

const router = Router();

router.post("/", addCategory);

export default router;
