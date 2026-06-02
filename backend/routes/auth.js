const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const config = require("../../config/env");
const { ok, fail } = require("../utils/response");

const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

function signUserToken(user) {
    return jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        config.JWT_SECRET,
        { expiresIn: config.JWT_USER_EXPIRES_IN }
    );
}

function publicUser(user) {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
}

// POST /api/auth/signup - Register a new user
router.post("/signup", async (req, res) => {
    try {
        // Coerce to strings to prevent NoSQL operator injection (e.g. {$gt: ""})
        const name = String(req.body.name || "").trim();
        const email = String(req.body.email || "").trim().toLowerCase();
        const password = String(req.body.password || "");

        if (!name || !email || !password) {
            return fail(res, { status: 400, message: "All fields are required" });
        }
        if (!EMAIL_REGEX.test(email)) {
            return fail(res, {
                status: 400,
                message: "Please enter a valid email address",
            });
        }
        if (password.length < 6) {
            return fail(res, {
                status: 400,
                message: "Password must be at least 6 characters long",
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return fail(res, {
                status: 409,
                message: "User already exists with this email",
            });
        }

        const user = await User.create({ name, email, password });
        const token = signUserToken(user);

        return ok(res, {
            status: 201,
            message: "Account created successfully",
            data: { user: publicUser(user), token },
        });
    } catch (error) {
        if (error.code === 11000 && error.keyPattern?.email) {
            return fail(res, {
                status: 409,
                message: "User already exists with this email",
            });
        }
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((e) => e.message);
            return fail(res, { status: 400, message: messages.join(", ") });
        }
        console.error("Signup error:", error.message);
        return fail(res, {
            status: 500,
            message: "Internal server error during registration",
        });
    }
});

// POST /api/auth/login - User login
router.post("/login", async (req, res) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();
        const password = String(req.body.password || "");

        if (!email || !password) {
            return fail(res, {
                status: 400,
                message: "Email and password are required",
            });
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return fail(res, {
                status: 401,
                message: "Invalid email or password",
            });
        }
        if (!user.isActive) {
            return fail(res, {
                status: 401,
                message: "Account has been deactivated",
            });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return fail(res, {
                status: 401,
                message: "Invalid email or password",
            });
        }

        const token = signUserToken(user);
        return ok(res, {
            message: "Login successful",
            data: { user: publicUser(user), token },
        });
    } catch (error) {
        console.error("Login error:", error.message);
        return fail(res, {
            status: 500,
            message: "Internal server error during login",
        });
    }
});

// POST /api/auth/verify - Verify a user JWT
router.post("/verify", async (req, res) => {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            return fail(res, { status: 401, message: "No token provided" });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user || !user.isActive) {
            return fail(res, {
                status: 401,
                message: "Invalid token or user not found",
            });
        }

        return ok(res, {
            message: "Token is valid",
            data: { user: publicUser(user) },
        });
    } catch (error) {
        return fail(res, { status: 401, message: "Invalid token" });
    }
});

module.exports = router;
