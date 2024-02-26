import User from "../models/userModel";

export const createUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = await User.create({ username, email, password });

        return res.status(201).json({ success: true, message: "User created", user });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Server error", source: "createUser", error: error.message });
    }
};
