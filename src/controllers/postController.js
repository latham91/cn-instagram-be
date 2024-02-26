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
            image: imageUrl.url,
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
        const posts = await Post.find({}, "-__v")
            .populate("userId", "-password -__v")
            .populate("likes", "-__v")
            .populate("comments", "-__v");

        if (posts.length === 0) {
            return res.status(404).json({ success: false, source: "getPosts", message: "No posts found" });
        }

        return res.status(200).json({ success: true, source: "getPosts", posts });
    } catch (error) {
        return res.status(500).json({ success: false, source: "getPosts", message: "Internal server error" });
    }
};
