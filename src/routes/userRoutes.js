import { Router } from "express";
import { registerUser, loginUser, verifyUser } from "../controllers/userController.js";
import { comparePassword, hashPassword } from "../middleware/auth.js";
import verifyJwt from "../middleware/verifyJwt.js";

const router = Router();

router.post("/register", hashPassword, registerUser);
router.post("/login", comparePassword, loginUser);
router.post("/verify", verifyJwt, verifyUser);

export default router;
