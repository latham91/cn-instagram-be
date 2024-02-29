import { Router } from "express";
import verifyJwt from "../middleware/verifyJwt.js";
import { getLikedPosts, likePost } from "../controllers/likeController.js";

const router = Router();

router.post("/:postId", verifyJwt, likePost);
router.get("/liked-posts", verifyJwt, getLikedPosts);

export default router;
