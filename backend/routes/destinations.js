const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const { authenticateToken, requireAdmin } = require("../middleware/auth");
const Destination = require("../models/Destination");
const { ok, fail } = require("../utils/response");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/destinations - List all destinations
router.get("/", async (req, res) => {
    try {
        const destinations = await Destination.find({}).sort({ createdAt: -1 });
        return ok(res, {
            data: destinations,
            message: destinations.length
                ? "Destinations fetched successfully"
                : "No destinations found",
            extra: { count: destinations.length },
        });
    } catch (error) {
        console.error("List destinations error:", error.message);
        return fail(res, { status: 500, message: "Failed to fetch destinations" });
    }
});

// GET /api/destinations/:id - Get a single destination
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) {
            return fail(res, { status: 400, message: "Invalid destination ID" });
        }

        const destination = await Destination.findById(id);
        if (!destination) {
            return fail(res, { status: 404, message: "Destination not found" });
        }

        return ok(res, {
            data: destination,
            message: "Destination fetched successfully",
        });
    } catch (error) {
        console.error("Get destination error:", error.message);
        return fail(res, { status: 500, message: "Failed to fetch destination" });
    }
});

// POST /api/destinations - Create a destination (admin only)
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
    try {
        const {
            name,
            location,
            description,
            image,
            category,
            bestTime,
            howToReach,
            attractions,
        } = req.body;

        if (!name || !location || !description) {
            return fail(res, {
                status: 400,
                message: "Name, location, and description are required",
            });
        }

        const destination = await Destination.create({
            name,
            location,
            description,
            image: image || "/assets/images/default-destination.jpg",
            category: category || "heritage",
            bestTime,
            howToReach,
            attractions: Array.isArray(attractions) ? attractions : [],
        });

        return ok(res, {
            status: 201,
            data: destination,
            message: "Destination added successfully",
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((e) => e.message);
            return fail(res, { status: 400, message: messages.join(", ") });
        }
        console.error("Create destination error:", error.message);
        return fail(res, { status: 500, message: "Failed to add destination" });
    }
});

// PUT /api/destinations/:id - Update a destination (admin only)
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) {
            return fail(res, { status: 400, message: "Invalid destination ID" });
        }

        const updated = await Destination.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!updated) {
            return fail(res, { status: 404, message: "Destination not found" });
        }

        return ok(res, {
            data: updated,
            message: "Destination updated successfully",
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((e) => e.message);
            return fail(res, { status: 400, message: messages.join(", ") });
        }
        console.error("Update destination error:", error.message);
        return fail(res, { status: 500, message: "Failed to update destination" });
    }
});

// DELETE /api/destinations/:id - Delete a destination (admin only)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) {
            return fail(res, { status: 400, message: "Invalid destination ID" });
        }

        const deleted = await Destination.findByIdAndDelete(id);
        if (!deleted) {
            return fail(res, { status: 404, message: "Destination not found" });
        }

        return ok(res, {
            data: deleted,
            message: "Destination deleted successfully",
        });
    } catch (error) {
        console.error("Delete destination error:", error.message);
        return fail(res, { status: 500, message: "Failed to delete destination" });
    }
});

module.exports = router;
