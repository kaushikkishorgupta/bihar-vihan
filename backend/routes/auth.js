const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// POST /api/auth/signup - Register new user
router.post("/signup", async (req, res) => {
    try {
        console.log('🚀 Signup request received:', {
            timestamp: new Date().toISOString(),
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            body: { ...req.body, password: '***' }
        });

        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Validate email format
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists with this email"
            });
        }

        // Create new user
        const user = new User({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password
        });

        await user.save();

        console.log('✅ User created successfully:', {
            userId: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            timestamp: new Date().toISOString()
        });

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET || "bihar-vihan-super-secret-jwt-key-2024-production-ready",
            { expiresIn: "7d" }
        );

        console.log('🔑 JWT token generated for user:', user.email);

        res.status(201).json({
            success: true,
            message: "Account created successfully",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            }
        });

    } catch (error) {
        console.error("❌ Signup error:", {
            timestamp: new Date().toISOString(),
            error: error.message,
            stack: error.stack,
            requestBody: { ...req.body, password: '***' },
            ip: req.ip
        });
        
        // Handle duplicate key error (MongoDB)
        if (error.code === 11000 && error.keyPattern?.email) {
            console.log('⚠️ Duplicate email attempt:', req.body.email);
            return res.status(409).json({
                success: false,
                message: "User already exists with this email"
            });
        }

        // Handle validation errors
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(err => err.message);
            console.log('⚠️ Validation error:', messages);
            return res.status(400).json({
                success: false,
                message: messages.join(", ")
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error during registration"
        });
    }
});

// POST /api/auth/login - User login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find user by email (include password for comparison)
        const user = await User.findOne({ email }).select("+password");
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Account has been deactivated"
            });
        }

        // Compare password
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET || "bihar-vihan-super-secret-jwt-key-2024-production-ready",
            { expiresIn: "7d" }
        );

        res.json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error during login"
        });
    }
});

// POST /api/auth/verify - Verify JWT token
router.post("/verify", async (req, res) => {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }

        // Verify token
        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || "bihar-vihan-super-secret-jwt-key-2024-production-ready"
        );

        // Find user
        const user = await User.findById(decoded.userId);
        
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Invalid token or user not found"
            });
        }

        res.json({
            success: true,
            message: "Token is valid",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        });

    } catch (error) {
        console.error("Token verification error:", error);
        res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
});

module.exports = router;
