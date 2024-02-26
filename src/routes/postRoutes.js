import { Router } from "express";
import { createPost, getPosts } from "../controllers/postController.js";
import verifyJwt from "../middleware/verifyJwt.js";

const router = Router();

router.get("/", getPosts);
router.post("/create", verifyJwt, createPost);

export default router;
