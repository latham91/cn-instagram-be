import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import chalk from "chalk";
import cors from "cors";
import cookieParser from "cookie-parser";
import dbConnect from "./db/connection.js";

// Route imports
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import likeRoutes from "./routes/likeRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";

const port = process.env.PORT || 5001;

// Load environment variables from .env file
dotenv.config();

// Express instance and required parsers
const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(
    cors({
        origin: ["http://localhost:5173", "http://192.168.1.145:5173", "https://cn-instagram-bes.onrender.com"],
        credentials: true,
    })
);

// Dev logging
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// Health check
app.get("/api/health", (req, res) => {
    try {
        return res.status(200).json({ message: "API is healthy" });
    } catch (error) {
        return res.status(500).json({ message: "API is unhealthy", error: error.message });
    }
});

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commentRoutes);

// Start server
app.listen(port, () => {
    dbConnect();
    console.log(chalk.bgBlue.bold(`Server running in ${process.env.NODE_ENV} mode on port ${port}`));
});
