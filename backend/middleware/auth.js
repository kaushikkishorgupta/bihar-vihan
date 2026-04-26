const jwt = require("jsonwebtoken");

// Authentication middleware
const authenticateToken = (req, res, next) => {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    // Check if token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Access token required",
            error: "No token provided"
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production");
        
        // Attach user info to request
        req.user = decoded;
        next();
        
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
            error: error.message
        });
    }
};

// Optional: Admin-only middleware
const requireAdmin = (req, res, next) => {
    // Check if user exists and has admin role
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: "Admin access required",
            error: "Insufficient permissions"
        });
    }
    
    next();
};

module.exports = {
    authenticateToken,
    requireAdmin
};
