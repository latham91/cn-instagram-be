import jwt from "jsonwebtoken";

const verifyJwt = async (req, res, next) => {
    const token = req.cookies.insta_auth;
    console.log(token);

    if (!token) {
        res.clearCookie("insta_auth");
        return res.status(401).json({ success: false, source: "verifyJwt", message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        next();
    } catch (error) {
        res.clearCookie("insta_auth");
        return res.status(401).json({ success: false, message: "Not authorized to access this route" });
    }
};

export default verifyJwt;
