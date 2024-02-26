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

        res.cookie("insta_auth", token, { httpOnly: true, maxAge: 900000 });

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
        return res
            .status(500)
            .json({ success: false, message: "Server error", source: "verifyUser", error: error.message });
    }
};
