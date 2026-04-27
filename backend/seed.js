const mongoose = require("mongoose");
const Destination = require("./models/Destination");

// Sample destinations data
const sampleDestinations = [
    {
        name: "Bodh Gaya",
        location: "Bodh Gaya, Bihar, India",
        description: "Bodh Gaya is a sacred Buddhist pilgrimage site where Gautama Buddha is said to have attained Enlightenment under the Bodhi Tree. It's a UNESCO World Heritage Site and one of the most important Buddhist pilgrimage destinations in the world.",
        image: "/assets/images/bodh-gaya.jpg",
        category: "heritage",
        bestTime: "October to March",
        howToReach: "By air, rail, and road from major cities",
        attractions: ["Mahabodhi Temple", "Bodhi Tree", "Thai Monastery", "Japanese Temple", "Bodh Gaya Museum"]
    },
    {
        name: "Nalanda University",
        location: "Nalanda, Bihar, India",
        description: "Nalanda was an ancient Mahavihara, a large Buddhist monastery that was a famed center of learning in the ancient kingdom of Magadha. The ruins of Nalanda showcase the glorious past of Indian education.",
        image: "/assets/images/nalanda.jpg",
        category: "heritage",
        bestTime: "November to February",
        howToReach: "By road from Patna (95 km), nearest railway station is Bihar Sharif",
        attractions: ["Nalanda Archaeological Museum", "Nalanda University Ruins", "Hiuen Tsang Memorial"]
    },
    {
        name: "Patna Sahib",
        location: "Patna, Bihar, India",
        description: "Takht Sri Patna Sahib is one of the most sacred Sikh shrines, marking the birthplace of Guru Gobind Singh, the tenth Sikh Guru. It's a beautiful gurdwara on the banks of the Ganges River.",
        image: "/assets/images/patna-sahib.jpg",
        category: "religious",
        bestTime: "October to March",
        howToReach: "Well connected by air, rail, and road from all major cities",
        attractions: ["Takht Sri Patna Sahib Gurdwara", "Guru Ka Bagh", "Golghar", "Patna Museum"]
    },
    {
        name: "Vaishali",
        location: "Vaishali, Bihar, India",
        description: "Vaishali was an ancient kingdom and one of the first republics in the world. It's famous for being the place where Lord Buddha delivered his last sermon and announced his Parinirvana.",
        image: "/assets/images/vaishali.jpg",
        category: "heritage",
        bestTime: "October to March",
        howToReach: "55 km from Patna, accessible by road",
        attractions: ["Ashokan Pillar", "Anand Stupa", "Buddha Stupa", "Vaishali Museum"]
    },
    {
        name: "Rajgir",
        location: "Rajgir, Bihar, India",
        description: "Rajgir is a city of great historical and religious significance, known for its association with Lord Buddha and Lord Mahavira. It's surrounded by rocky hills and offers breathtaking views.",
        image: "/assets/images/rajgir.jpg",
        category: "heritage",
        bestTime: "October to March",
        howToReach: "100 km from Patna, well connected by road",
        attractions: ["Venu Vana", "Saptaparni Cave", "Gridhakuta Hill", "Jain Temples"]
    }
];

// Seed function to add sample data
const seedDestinations = async () => {
    try {
        // Clear existing destinations
        await Destination.deleteMany({});
        console.log("🗑️ Cleared existing destinations");

        // Insert sample destinations
        const insertedDestinations = await Destination.insertMany(sampleDestinations);
        console.log(`✅ Added ${insertedDestinations.length} sample destinations`);
        
        console.log("📋 Sample destinations:");
        insertedDestinations.forEach((dest, index) => {
            console.log(`  ${index + 1}. ${dest.name} - ${dest.location}`);
        });
        
        return insertedDestinations;
    } catch (error) {
        console.error("❌ Error seeding destinations:", error);
        throw error;
    }
};

// Run seed function if called directly
if (require.main === module) {
    mongoose.connect("mongodb+srv://kaushikkishorgupta_db_user:biharvihaan123@biharvihaan.t9v4jsq.mongodb.net/bihar-vihan", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async () => {
        console.log("🔗 Connected to MongoDB for seeding");
        await seedDestinations();
        console.log("🎉 Seeding completed!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    });
}

module.exports = { seedDestinations, sampleDestinations };
