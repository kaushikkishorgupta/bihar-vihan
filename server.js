// Load environment variables
require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");

// Initialize Express app
const app = express();

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(limiter);
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            mediaSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https:"],
            connectSrc: ["'self'"],
        },
    },
})); // Security headers
app.use(cors({
    origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'https://your-frontend-url.vercel.app'],
    credentials: true
})); // Cross-origin requests
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
const adminRouter = require("./backend/routes/admin");
app.use("/api/destinations", destinationsRouter);
app.use("/api/admin", adminRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // Don't send error details in production
    const errorDetails = process.env.NODE_ENV === 'production' 
        ? 'Internal Server Error' 
        : err.message;
    
    res.status(err.status || 500).json({
        success: false,
        error: errorDetails,
        timestamp: new Date().toISOString(),
        path: req.path
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Route not found",
        timestamp: new Date().toISOString(),
        path: req.path
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 Serving static files from: ${path.join(__dirname, "public")}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
