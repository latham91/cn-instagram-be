import { Router } from "express";
import verifyJwt from "../middleware/verifyJwt.js";
import { likePost } from "../controllers/likeController.js";

const router = Router();

router.post("/:postId", verifyJwt, likePost);

export default router;
