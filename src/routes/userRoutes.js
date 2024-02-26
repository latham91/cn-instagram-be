import { Router } from "express";
import { createUser } from "../controllers/userController";
import { comparePassword, hashPassword } from "../middleware/auth";

const router = Router();

router.get("/register", hashPassword, createUser);
router.get("/login", comparePassword, createUser);

export default router;
