import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const verifyJwt = async (req, res, next) => {
    try {
        const token = req.cookies.insta_auth;

        if (!token) {
            if (req.user && req.user.id) {
                await User.findOneAndUpdate({ _id: req.user.id }, { $set: { isOnline: false } });
            }

            return res.status(401).json({ success: false, source: "verifyJwt", message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();
    } catch (error) {
        if (req.user && req.user.id) {
            await User.findOneAndUpdate({ _id: req.user.id }, { $set: { isOnline: false } });
        }

        return res.status(401).json({ success: false, message: "Not authorized to access this route" });
    }
};

export default verifyJwt;
