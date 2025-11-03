import { Router, urlencoded } from "express";
import {
  getAllUsers,
  deleteUser,
  makeAdmin,
  removeAdmin,
} from "../controllers/user.controller.js";

const router = Router();

router.use(urlencoded({ extended: true }));

router.get("/allUsers", getAllUsers);
router.delete("/delete/:userId", deleteUser);
router.patch("/make-admin/:userId", makeAdmin);
router.patch("/remove-admin/:userId", removeAdmin);

export default router;
