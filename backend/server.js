// Load environment variables
require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

// Initialize Express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'https://your-frontend-url.vercel.app'],
    credentials: true
})); // Cross-origin requests
app.use(morgan("dev")); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "../public")));

// Database connection with timeout settings (server will work even if MongoDB fails)
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
})
.then(() => {
    console.log("✅ MongoDB connected successfully");
})
.catch((error) => {
    console.error("❌ MongoDB connection failed:", error.message);
    // Don't exit the process, continue without MongoDB
    console.log("🔄 Server will continue without MongoDB...");
});

// Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});

// API Routes - Health Check
app.get("/api/health", (req, res) => {
    res.json({ 
        status: "healthy", 
        message: "Server working perfectly 🚀",
        timestamp: new Date().toISOString()
    });
});

// Import and use routes
const destinationsRouter = require("./routes/destinations");
const adminRouter = require("./routes/admin");
app.use("/api/destinations", destinationsRouter);
app.use("/api/admin", adminRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Serving static files from: ${path.join(__dirname, "../public")}`);
});
