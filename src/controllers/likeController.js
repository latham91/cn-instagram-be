import Like from "../models/likeModel.js";
import User from "../models/userModel.js";
import Post from "../models/postModel.js";

export const likePost = async (req, res) => {
    try {
        const { postId } = req.params;

        const like = await Like.findOne({ userId: req.user.id, postId });

        if (!like) {
            const newLike = await Like.create({
                userId: req.user.id,
                postId,
            });

            // Add the user's ID to the likes array of the post
            await Post.findByIdAndUpdate(postId, { $push: { likes: req.user.id } });

            // Add the newLike _id to the user's likes array
            await User.findByIdAndUpdate(req.user.id, { $push: { likes: newLike._id } });

            return res.status(201).json({ success: true, source: "likePost", message: "Post liked", like: newLike });
        }

        // Remove the user's ID from the likes array of the post
        await Post.findByIdAndUpdate(postId, { $pull: { likes: req.user.id } });

        // Remove the like from the user's likes array
        await User.findByIdAndUpdate(req.user.id, { $pull: { likes: like._id } });

        await Like.findByIdAndDelete(like._id);

        return res.status(200).json({ success: true, source: "likePost", message: "Post unliked" });
    } catch (error) {
        return res.status(500).json({ success: false, source: "likePost", message: "Internal server error" });
    }
};

export const getLikedPosts = async (req, res) => {
    try {
        const { id } = req.user;

        // Find the user by id and populate the 'likes' field with the corresponding 'Post' documents
        const posts = await Post.find({ likes: { $in: [id] } }).populate("userId");

        if (!posts) {
            return res.status(404).json({ success: false, source: "getLikedPosts", message: "User not found" });
        }

        return res.status(200).json({ success: true, source: "getLikedPosts", posts });
    } catch (error) {
        return res.status(500).json({ success: false, source: "getLikedPosts", message: "Internal server error" });
    }
};
