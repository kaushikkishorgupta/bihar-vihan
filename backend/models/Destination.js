const mongoose = require("mongoose");

// Destination schema. Fields beyond name/location/description were previously
// used by the API routes but absent here, so they were silently dropped on save.
const destinationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        location: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        image: {
            type: String,
            default: "/assets/images/default-destination.jpg",
        },
        category: {
            type: String,
            trim: true,
            default: "heritage",
        },
        bestTime: {
            type: String,
            trim: true,
        },
        howToReach: {
            type: String,
            trim: true,
        },
        attractions: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true }
);

// Indexes for the common access patterns (sort by recency, filter by category).
destinationSchema.index({ createdAt: -1 });
destinationSchema.index({ category: 1 });

module.exports = mongoose.model("Destination", destinationSchema);
