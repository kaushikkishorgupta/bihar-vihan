const mongoose = require("mongoose");

// Database connection function
const connectDB = async () => {
    try {
        // Get MongoDB URI from environment variables
        const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/bihar-vihan";
        
        // Connect to MongoDB
        const conn = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        process.exit(1); // Exit process with failure
    }
};

// Disconnect function
const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        console.log("✅ MongoDB Disconnected");
    } catch (error) {
        console.error("❌ MongoDB Disconnect Error:", error.message);
    }
};

module.exports = { connectDB, disconnectDB };
