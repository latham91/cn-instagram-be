import jwt from "jsonwebtoken";

const verifyJwt = async (req, res, next) => {
    try {
        const token = req.cookies.insta_auth;

        if (!token) {
            return res.status(401).json({ success: false, source: "verifyJwt", message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Not authorized to access this route" });
    }
};

export default verifyJwt;
