import { Router } from "express";
import { createPost, deletePost, getPosts, getUserPosts } from "../controllers/postController.js";
import verifyJwt from "../middleware/verifyJwt.js";

const router = Router();

router.get("/", getPosts);
router.post("/create", verifyJwt, createPost);
router.delete("/:postId", verifyJwt, deletePost);
router.get("/:username", getUserPosts);

export default router;
