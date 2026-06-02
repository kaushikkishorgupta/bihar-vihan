const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../../config/env");

// Authentication middleware: verifies the Bearer JWT and attaches the payload.
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Access token required",
        });
    }

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

// Admin-only guard. Requires authenticateToken to have run first.
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Admin access required",
        });
    }
    next();
};

module.exports = {
    authenticateToken,
    requireAdmin,
};
