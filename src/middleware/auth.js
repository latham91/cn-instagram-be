import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../models/userModel";

dotenv.config();
const saltRounds = parseInt(process.env.SALT_ROUNDS);

export const hashPassword = async (req, res, next) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ success: false, message: "Password is required" });
        }

        const hashed = await bcrypt.hash(password, saltRounds);
        req.body.password = hashed;

        next();
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Server error", source: "hashPassword", error: error.message });
    }
};

export const comparePassword = async (req, res, next) => {
    try {
        const { password, email } = req.body;

        if (!password || !email) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const userExists = await User.findOne({ email });

        if (!userExists) {
            return res.status(404).json({ success: false, message: "Account not found" });
        }

        const match = await bcrypt.compare(password, userExists.password);

        if (!match) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        req.user = {
            id: userExists._id,
            username: userExists.username,
            email: userExists.email,
        };

        next();
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Server error", source: "comparePassword", error: error.message });
    }
};
