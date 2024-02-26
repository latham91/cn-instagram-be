import { Router } from "express";
import verifyJwt from "../middleware/verifyJwt.js";
import { createComment } from "../controllers/commentController.js";

const router = Router();

router.post("/:postId/create", verifyJwt, createComment);

export default router;
