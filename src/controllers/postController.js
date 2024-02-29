import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const createPost = async (req, res) => {
    try {
        const { id, description, image } = req.body;

        if (!id || !description || !image) {
            return res.status(400).json({ success: false, source: "createPost", message: "Please fill in all fields" });
        }

        const imageUrl = await cloudinary.uploader.upload(image);

        const newPost = await Post.create({
            description,
            image: imageUrl.secure_url,
            userId: req.user.id,
        });

        const addPostToUser = await User.findByIdAndUpdate({ _id: req.user.id }, { $push: { posts: newPost._id } });

        if (!addPostToUser) {
            return res
                .status(500)
                .json({ success: false, source: "createPost", message: "Unable to add post to user's posts" });
        }

        return res
            .status(201)
            .json({ success: true, source: "createPost", message: "Post created successfully", post: newPost });
    } catch (error) {
        return res.status(500).json({ success: false, source: "createPost", message: "Internal server error" });
    }
};

export const getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate([
                {
                    path: "userId",
                    select: "-password -__v -comments -likes -posts",
                },
                {
                    path: "likes",
                    select: "-__v",
                },
                {
                    path: "comments",
                    select: "-__v",
                    populate: {
                        path: "userId",
                        select: "username",
                    },
                },
            ])
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, source: "getPosts", posts });
    } catch (error) {
        return res.status(500).json({ success: false, source: "getPosts", message: "Internal server error" });
    }
};

export const deletePost = async (req, res) => {
    try {
        const postAuthor = req.body.userId;
        const { postId } = req.params;

        if (postAuthor !== req.user.id) {
            return res.status(403).json({ success: false, source: "deletePost", message: "You are not authorized" });
        }

        const deletedPost = await Post.findByIdAndDelete({ _id: postId });

        if (!deletedPost) {
            return res.status(404).json({ success: false, source: "deletePost", message: "Post not found" });
        }

        // Comments for my sanity
        // Delete image from cloudinary
        const imageId = deletedPost.image.split("/").pop().split(".")[0];
        const deleteCloudinaryImage = await cloudinary.uploader.destroy(imageId);

        if (deleteCloudinaryImage.result !== "ok") {
            return res
                .status(500)
                .json({ success: false, source: "deletePost", message: "Unable to delete image from cloudinary" });
        }

        // Delete post from user's posts
        const deletePostFromUser = await User.findByIdAndUpdate({ _id: req.user.id }, { $pull: { posts: postId } });

        if (!deletePostFromUser) {
            return res
                .status(500)
                .json({ success: false, source: "deletePost", message: "Unable to delete post from user's posts" });
        }

        // Delete likes and comments associated with the post
        await Promise.all([
            Post.updateOne({ _id: postId }, { $pull: { likes: { postId } } }),
            Post.updateOne({ _id: postId }, { $pull: { comments: { postId } } }),
            User.updateMany({}, { $pull: { likes: { postId } } }),
        ]);

        return res.status(200).json({ success: true, source: "deletePost", message: "Post deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, source: "deletePost", message: "Internal server error" });
    }
};

export const getUserPosts = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username }); // Assuming you have the username of the user whose posts you want to find
        if (!user) {
            return res.status(404).json({ success: false, source: "getUserPosts", message: "User not found" });
        }

        const userPosts = await Post.find({ userId: user._id }) // Find posts belonging to the user
            .populate([
                {
                    path: "userId",
                    select: "createdAt username _id",
                },
                {
                    path: "likes",
                    select: "_id",
                },
                {
                    path: "comments",
                    select: "-__v -updatedAt",
                    populate: {
                        path: "userId",
                        select: "username",
                    },
                },
            ])
            .sort({ createdAt: -1 });

        if (!userPosts) {
            return res.status(404).json({ success: false, source: "getUserPosts", message: "No posts found" });
        }

        return res.status(200).json({ success: true, source: "getUserPosts", userPosts });
    } catch (error) {
        return res.status(500).json({ success: false, source: "getUserPosts", message: "Internal server error" });
    }
};
