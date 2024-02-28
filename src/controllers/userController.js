import dotenv from "dotenv";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

dotenv.config();

export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ success: false, message: "Account already exists" });
        }

        const user = await User.create({ username, email, password });

        return res.status(201).json({ success: true, message: "User created", user });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Server error", source: "createUser", error: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const { id, username, email, password } = req.user;

        const token = jwt.sign({ id: id, username, email, password }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE,
        });

        res.cookie("insta_auth", token, {
            maxAge: 900000,
            httpOnly: true,
            secure: true,
        });

        await User.findByIdAndUpdate(id, { isOnline: true }, { new: true });

        return res.status(200).json({ success: true, message: `${username} logged in`, user: req.user, token });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Server error", source: "loginUser", error: error.message });
    }
};

export const verifyUser = async (req, res) => {
    try {
        return res.status(200).json({ success: true, user: req.user });
    } catch (error) {
        await User.findByIdAndUpdate(req.user.id, { isOnline: false }, { new: true });
        await res.clearCookie("insta_auth", {
            httpOnly: true,
            secure: true,
        });
        return res
            .status(500)
            .json({ success: false, message: "Server error", source: "verifyUser", error: error.message });
    }
};

export const logoutUser = async (req, res) => {
    try {
        const { id } = req.user;
        await User.findByIdAndUpdate(id, { isOnline: false }, { new: true });

        res.clearCookie("insta_auth", {
            httpOnly: true,
            secure: true,
        });

        return res.status(200).json({ success: true, message: "User logged out" });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Server error", source: "logoutUser", error: error.message });
    }
};

export const getOnlineUsers = async (req, res) => {
    try {
        const users = await User.find({ isOnline: true }, ["username", "isOnline"]);

        return res.status(200).json({ success: true, source: "getOnlineUsers", message: "Online users", users });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Server error", source: "getOnlineUsers", error: error.message });
    }
};
