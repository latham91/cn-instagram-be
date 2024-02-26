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

            await User.findByIdAndUpdate({ _id: req.user.id }, { $push: { likes: newLike._id } });
            await Post.findByIdAndUpdate({ _id: postId }, { $push: { likes: newLike._id } });

            return res.status(201).json({ success: true, source: "likePost", message: "Post liked", like: newLike });
        }

        await Like.findByIdAndDelete(like._id);
        await User.findByIdAndUpdate({ _id: req.user.id }, { $pull: { likes: like._id } });
        await Post.findByIdAndUpdate({ _id: postId }, { $pull: { likes: like._id } });

        return res.status(200).json({ success: true, source: "likePost", message: "Post unliked" });
    } catch (error) {
        return res.status(500).json({ success: false, source: "likePost", message: "Internal server error" });
    }
};
