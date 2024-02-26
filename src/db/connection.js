import mongoose from "mongoose";
import chalk from "chalk";

const dbConnect = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(chalk.bgYellow.bold(`MongoDB connected to database: ${conn.connection.name}`));
    } catch (error) {
        return console.error("Error: ", error.message);
    }
};

export default dbConnect;
