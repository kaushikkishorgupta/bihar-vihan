const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Admin credentials (simple for demo)
const ADMIN_CREDENTIALS = {
    username: "admin",
    password: "admin123"
};

// Middleware to parse JSON
router.use(express.json());

// POST /api/admin/login - Admin login
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Basic validation
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required"
            });
        }
        
        // Check credentials
        if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                username: username,
                role: "admin",
                loginTime: new Date().toISOString()
            },
            process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production",
            { expiresIn: "24h" }
        );
        
        res.json({
            success: true,
            message: "Login successful",
            token: token,
            user: {
                username: username,
                role: "admin"
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: "Login failed"
        });
    }
});

// POST /api/admin/verify - Verify JWT token
router.post("/verify", async (req, res) => {
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Token is required"
            });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production");
        
        res.json({
            success: true,
            message: "Token is valid",
            user: decoded
        });
        
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Invalid or expired token",
            error: error.message
        });
    }
});

// POST /api/admin/logout - Logout (client-side token removal)
router.post("/logout", async (req, res) => {
    res.json({
        success: true,
        message: "Logout successful. Please remove token from client storage."
    });
});

module.exports = router;
