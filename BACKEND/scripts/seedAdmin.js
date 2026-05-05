/**
 * Seed Script — Creates the default admin user
 * Run: node scripts/seedAdmin.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/User");

const ADMIN_EMAIL = "dipnayak99@gmail.com";
const ADMIN_PASSWORD = "Admin@123";
const ADMIN_NAME = "Dip Nayak";

async function seed() {
    try {
        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const existing = await User.findOne({ email: ADMIN_EMAIL });
        if (existing) {
            let updated = false;
            if (existing.role !== "admin") {
                existing.role = "admin";
                updated = true;
            }
            if (!existing.isEmailVerified) {
                existing.isEmailVerified = true;
                updated = true;
            }
            if (updated) {
                await existing.save();
                console.log(`♻️  Existing user promoted to admin (email verified): ${ADMIN_EMAIL}`);
            } else {
                console.log(`✅ Admin already exists: ${ADMIN_EMAIL}`);
            }
        } else {
            await User.create({
                name: ADMIN_NAME,
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                role: "admin",
                isActive: true,
                isEmailVerified: true, // Admin accounts are pre-verified
                storageLimit: 100 * 1024 * 1024 * 1024, // 100 GB for admin
            });
            console.log(`🎉 Admin user created: ${ADMIN_EMAIL}`);
        }

        await mongoose.disconnect();
        console.log("👋 Disconnected. Done!\n");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seed failed:", err.message);
        process.exit(1);
    }
}

seed();
