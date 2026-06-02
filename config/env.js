// Centralised environment configuration and validation.
// Loaded once and reused so secrets are never hardcoded in route files.
require("dotenv").config();

const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";

// Insecure value used ONLY for local development when JWT_SECRET is unset.
// In production a missing JWT_SECRET is a fatal error.
const DEV_JWT_SECRET = "dev-only-insecure-jwt-secret-change-me";

let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    if (isProduction) {
        throw new Error(
            "JWT_SECRET is required in production. Set it as an environment variable."
        );
    }
    JWT_SECRET = DEV_JWT_SECRET;
    // eslint-disable-next-line no-console
    console.warn(
        "⚠️  JWT_SECRET not set — using an insecure development default. " +
            "Set JWT_SECRET before deploying."
    );
}

const config = {
    NODE_ENV,
    isProduction,
    PORT: parseInt(process.env.PORT, 10) || 3000,
    MONGODB_URI:
        process.env.MONGODB_URI || "mongodb://localhost:27017/bihar-vihan",
    JWT_SECRET,
    JWT_USER_EXPIRES_IN: process.env.JWT_USER_EXPIRES_IN || "7d",
    JWT_ADMIN_EXPIRES_IN: process.env.JWT_ADMIN_EXPIRES_IN || "24h",
    // Admin credentials are read from the environment. ADMIN_PASSWORD_HASH must be
    // a bcrypt hash; ADMIN_PASSWORD (plaintext) is supported only as a local-dev
    // convenience and should never be used in production.
    ADMIN_USERNAME: process.env.ADMIN_USERNAME || "admin",
    ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH || "",
    // Dev-only default keeps the demo admin login (admin / admin123) working out of
    // the box. It is ONLY honoured when NODE_ENV !== "production"; production must
    // set ADMIN_PASSWORD_HASH. Override via the ADMIN_PASSWORD env var.
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || (isProduction ? "" : "admin123"),
    // Comma-separated list of allowed CORS origins.
    CORS_ORIGINS: (
        process.env.CORS_ORIGINS ||
        "http://localhost:3000,https://bihar-vihan.vercel.app"
    )
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean),
};

module.exports = config;
