const mongoose = require("mongoose");
const { MONGODB_URI } = require("./env");

// Connect to MongoDB. The connection is optional: if it fails the server keeps
// running (static pages and health checks still work), matching the original
// fault-tolerant behaviour.
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGODB_URI);
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.warn(
            "⚠️  MongoDB connection failed, continuing without it:",
            error.message
        );
        return null;
    }
};

const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        console.log("✅ MongoDB disconnected");
    } catch (error) {
        console.error("❌ MongoDB disconnect error:", error.message);
    }
};

module.exports = { connectDB, disconnectDB };
