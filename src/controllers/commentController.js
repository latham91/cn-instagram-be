import Comment from "../models/commentModel.js";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";

export const createComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { id } = req.user;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ success: false, message: "Content is required", source: "createComment" });
        }

        const newComment = await Comment.create({
            content,
            postId: postId,
            userId: id,
        });

        await Post.findByIdAndUpdate(postId, { $push: { comments: newComment._id } });
        await User.findByIdAndUpdate(id, { $push: { comments: newComment._id } });

        return res.status(201).json({ success: true, message: "Comment created successfully", comment: newComment });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Server error", source: "createComment", error: error.message });
    }
};

export const getComments = async (req, res) => {
    try {
        const { postId } = req.params;

        const comments = await Comment.find({ post: postId }).populate("user", "username");

        return res.status(200).json({ success: true, comments });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Server error", source: "getComments", error: error.message });
    }
};
