const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const Destination = require("../models/Destination");

// GET /api/destinations - Fetch all destinations
router.get("/", async (req, res) => {
    try {
        const destinations = await Destination.find({}).sort({ createdAt: -1 });
        
        if (destinations.length === 0) {
            return res.json({
                success: true,
                data: [],
                message: "No destinations found"
            });
        }
        
        res.json({
            success: true,
            data: destinations,
            count: destinations.length,
            message: "Destinations fetched successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: "Failed to fetch destinations"
        });
    }
});

// GET /api/destinations/:id - Get single destination
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: "Invalid destination ID",
                message: "Please provide a valid destination ID"
            });
        }
        
        const destination = await Destination.findById(id);
        
        if (!destination) {
            return res.status(404).json({
                success: false,
                error: "Destination not found",
                message: "The requested destination does not exist"
            });
        }
        
        res.json({
            success: true,
            data: destination,
            message: "Destination fetched successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: "Failed to fetch destination"
        });
    }
});

// POST /api/destinations - Add new destination (protected)
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, location, description, image, category, bestTime, howToReach, attractions } = req.body;
        
        // Basic validation
        if (!name || !location || !description) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields",
                message: "Name, location, and description are required"
            });
        }
        
        // Create new destination
        const newDestination = new Destination({
            name,
            location,
            description,
            image: image || '/assets/images/default-destination.jpg',
            category: category || 'heritage',
            bestTime,
            howToReach,
            attractions: attractions || []
        });
        
        const savedDestination = await newDestination.save();
        
        res.status(201).json({
            success: true,
            data: savedDestination,
            message: "Destination added successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: "Failed to add destination"
        });
    }
});

// PUT /api/destinations/:id - Update destination (protected)
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: "Invalid destination ID",
                message: "Please provide a valid destination ID"
            });
        }
        
        const updatedDestination = await Destination.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        );
        
        if (!updatedDestination) {
            return res.status(404).json({
                success: false,
                error: "Destination not found",
                message: "The requested destination does not exist"
            });
        }
        
        res.json({
            success: true,
            data: updatedDestination,
            message: "Destination updated successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: "Failed to update destination"
        });
    }
});

// DELETE /api/destinations/:id - Delete destination (protected)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: "Invalid destination ID",
                message: "Please provide a valid destination ID"
            });
        }
        
        const deletedDestination = await Destination.findByIdAndDelete(id);
        
        if (!deletedDestination) {
            return res.status(404).json({
                success: false,
                error: "Destination not found",
                message: "The requested destination does not exist"
            });
        }
        
        res.json({
            success: true,
            data: deletedDestination,
            message: "Destination deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: "Failed to delete destination"
        });
    }
});

module.exports = router;
