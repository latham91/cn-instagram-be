import { Router } from "express";
import {
    registerUser,
    loginUser,
    verifyUser,
    getOnlineUsers,
    logoutUser,
    setOffline,
} from "../controllers/userController.js";
import { comparePassword, hashPassword } from "../middleware/auth.js";
import verifyJwt from "../middleware/verifyJwt.js";

const router = Router();

router.post("/register", hashPassword, registerUser);
router.post("/login", comparePassword, loginUser);
router.post("/verify", verifyJwt, verifyUser);
router.get("/online", verifyJwt, getOnlineUsers);
router.post("/logout", verifyJwt, logoutUser);
router.post("/setoffline", verifyJwt, setOffline);

export default router;
