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
// app.use(helmet()); // Temporarily disabled for CSS loading
app.use(cors()); // Cross-origin requests
app.use(morgan("dev")); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));

// Database connection (optional - server will work without MongoDB)
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/bihar-vihan", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("✅ MongoDB connected successfully");
})
.catch((error) => {
    console.log("⚠️ MongoDB connection failed, but server will continue:", error.message);
    // Don't exit the process, continue without MongoDB
});

// Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

// API Routes
app.get("/api/health", (req, res) => {
    res.json({
        message: "Server chal raha hai 🚀",
        status: "healthy",
        timestamp: new Date().toISOString()
    });
});

// Import and use routes
const destinationsRouter = require("./backend/routes/destinations");
app.use("/api/destinations", destinationsRouter);

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
    console.log(`📁 Serving static files from: ${path.join(__dirname, "public")}`);

][PPL       ]});
