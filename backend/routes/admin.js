const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const config = require("../../config/env");
const { ok, fail } = require("../utils/response");

// Verify a supplied admin password against the configured credentials.
// Prefers ADMIN_PASSWORD_HASH (bcrypt). Falls back to plaintext ADMIN_PASSWORD
// for local development only.
async function isValidAdminPassword(password) {
    if (config.ADMIN_PASSWORD_HASH) {
        return bcrypt.compare(password, config.ADMIN_PASSWORD_HASH);
    }
    if (!config.isProduction && config.ADMIN_PASSWORD) {
        return password === config.ADMIN_PASSWORD;
    }
    return false;
}

// POST /api/admin/login - Admin login
router.post("/login", async (req, res) => {
    try {
        const username = String(req.body.username || "");
        const password = String(req.body.password || "");

        if (!username || !password) {
            return fail(res, {
                status: 400,
                message: "Username and password are required",
            });
        }

        const usernameMatches = username === config.ADMIN_USERNAME;
        const passwordMatches = await isValidAdminPassword(password);

        if (!usernameMatches || !passwordMatches) {
            return fail(res, {
                status: 401,
                message: "Invalid username or password",
            });
        }

        const token = jwt.sign(
            { username, role: "admin" },
            config.JWT_SECRET,
            { expiresIn: config.JWT_ADMIN_EXPIRES_IN }
        );

        // Keep the original top-level { token, user } shape for the admin frontend.
        return ok(res, {
            message: "Login successful",
            extra: { token, user: { username, role: "admin" } },
        });
    } catch (error) {
        return fail(res, { status: 500, message: "Login failed" });
    }
});

// POST /api/admin/verify - Verify JWT token
router.post("/verify", async (req, res) => {
    try {
        const token =
            req.headers.authorization?.replace("Bearer ", "") || req.body.token;

        if (!token) {
            return fail(res, { status: 400, message: "Token is required" });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);
        // Keep the original top-level { user } shape for the admin frontend.
        return ok(res, { message: "Token is valid", extra: { user: decoded } });
    } catch (error) {
        return fail(res, { status: 401, message: "Invalid or expired token" });
    }
});

// POST /api/admin/logout - Logout (client clears its stored token)
router.post("/logout", async (req, res) => {
    return ok(res, {
        message: "Logout successful. Please remove the token from client storage.",
    });
});

module.exports = router;
