const express = require("express");
const router = express.Router();

// Get all destinations
router.get("/", async (req, res) => {
    try {
        // TODO: Implement with Mongoose models
        const destinations = [
            {
                id: 1,
                name: "Bodh Gaya",
                location: "Bihar, India",
                description: "Sacred Buddhist pilgrimage site",
                image: "/assets/images/bodh-gaya.jpg"
            },
            {
                id: 2,
                name: "Nalanda University",
                location: "Nalanda, Bihar",
                description: "Ancient center of learning",
                image: "/assets/images/nalanda.jpg"
            },
            {
                id: 3,
                name: "Patna Sahib",
                location: "Patna, Bihar",
                description: "Sacred Sikh pilgrimage site",
                image: "/assets/images/patna-sahib.jpg"
            }
        ];
        
        res.json({
            success: true,
            data: destinations,
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

// Get single destination by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        
        // TODO: Implement with Mongoose models
        const destination = {
            id: parseInt(id),
            name: "Bodh Gaya",
            location: "Bihar, India",
            description: "Bodh Gaya is a sacred Buddhist pilgrimage site where Gautama Buddha is said to have attained Enlightenment under the Bodhi Tree.",
            image: "/assets/images/bodh-gaya.jpg",
            attractions: ["Mahabodhi Temple", "Bodhi Tree", "Thai Monastery"],
            bestTime: "October to March",
            howToReach: "By air, rail, and road from major cities"
        };
        
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

// Add new destination (for admin)
router.post("/", async (req, res) => {
    try {
        const { name, location, description, image } = req.body;
        
        // Basic validation
        if (!name || !location) {
            return res.status(400).json({
                success: false,
                message: "Name and location are required"
            });
        }
        
        // TODO: Save to MongoDB using Mongoose models
        const newDestination = {
            id: Date.now(), // Temporary ID
            name,
            location,
            description,
            image: image || "/assets/images/default-destination.jpg"
        };
        
        res.status(201).json({
            success: true,
            data: newDestination,
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

module.exports = router;
