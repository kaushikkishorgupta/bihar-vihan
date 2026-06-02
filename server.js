const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const path = require("path");

const config = require("./config/env");
const { connectDB } = require("./config/db");

const app = express();

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per window
    message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Security headers
app.use(
    helmet({
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
    })
);

// CORS (origins configurable via CORS_ORIGINS)
app.use(
    cors({
        origin: config.CORS_ORIGINS,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(morgan(config.isProduction ? "combined" : "dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Strip keys containing $ / . from request payloads to prevent NoSQL operator injection
app.use(mongoSanitize());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Connect to MongoDB (non-fatal if unavailable)
connectDB();

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Server chal raha hai 🚀",
        status: "healthy",
        timestamp: new Date().toISOString(),
    });
});

// API routes
app.use("/api/destinations", require("./backend/routes/destinations"));
app.use("/api/admin", require("./backend/routes/admin"));
app.use("/api/auth", require("./backend/routes/auth"));

// Root
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

// Centralised error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error(err.stack);
    const message = config.isProduction ? "Internal Server Error" : err.message;
    res.status(err.status || 500).json({
        success: false,
        message,
        timestamp: new Date().toISOString(),
        path: req.path,
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
        timestamp: new Date().toISOString(),
        path: req.path,
    });
});

app.listen(config.PORT, () => {
    console.log(`🚀 Server running on port ${config.PORT}`);
    console.log(`🌍 Environment: ${config.NODE_ENV}`);
});

module.exports = app;
