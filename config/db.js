const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        // Use the connection string without deprecated options
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1); // Exit application on failure
    }
};

module.exports = connectDB;