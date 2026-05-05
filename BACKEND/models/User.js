const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [50, "Name cannot exceed 50 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false, // Never return password by default
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        otp: {
            type: String,
            default: null,
            select: false,
        },
        otpExpiry: {
            type: Date,
            default: null,
            select: false,
        },
        phone: {
            type: String,
            default: null,
            trim: true,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        storageUsed: {
            type: Number,
            default: 0, // in bytes
        },
        storageLimit: {
            type: Number,
            default: 5 * 1024 * 1024 * 1024, // 5GB default
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        avatar: {
            type: String,
            default: null,
        },
        lastLogin: {
            type: Date,
            default: null,
        },
        // 4-digit hide/unhide PIN (stored hashed)
        hidePin: {
            type: String,
            default: null,
            select: false,
        },
        hidePinSet: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre("save", async function () {
    if (this.isModified("password")) {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
    }
    if (this.isModified("hidePin") && this.hidePin) {
        const salt = await bcrypt.genSalt(10);
        this.hidePin = await bcrypt.hash(this.hidePin, salt);
        this.hidePinSet = true;
    }
    // Admin accounts are always considered email-verified
    if (this.role === "admin" && !this.isEmailVerified) {
        this.isEmailVerified = true;
    }
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Compare entered PIN with hashed PIN
userSchema.methods.compareHidePin = async function (enteredPin) {
    if (!this.hidePin) return false;
    return await bcrypt.compare(String(enteredPin), this.hidePin);
};

// Return safe user object (no password, no hidePin hash)
userSchema.methods.toSafeObject = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.hidePin;
    return obj;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
