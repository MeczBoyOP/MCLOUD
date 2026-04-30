const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/User");
const { generateToken } = require("../utils/generateToken");
const { sendSuccess, sendCreated, sendError } = require("../utils/response");

// ─── POST /api/auth/register ───────────────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Check if email already taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return sendError(res, "An account with this email already exists", 409);
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return sendCreated(res, "Account created successfully", {
        token,
        user: user.toSafeObject(),
    });
});

// ─── POST /api/auth/login ──────────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Include password in query (select:false by default)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return sendError(res, "Invalid email or password", 401);
    }

    if (!user.isActive) {
        return sendError(res, "Your account has been deactivated. Contact support.", 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return sendError(res, "Invalid email or password", 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    return sendSuccess(res, "Login successful", {
        token,
        user: user.toSafeObject(),
    });
});

// ─── GET /api/auth/me ──────────────────────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        return sendError(res, "User not found", 404);
    }
    return sendSuccess(res, "Profile fetched", user.toSafeObject());
});

// ─── PUT /api/auth/me ──────────────────────────────────────────────────────────
const updateMe = asyncHandler(async (req, res) => {
    const allowedFields = ["name", "avatar"];
    const updates = {};
    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true,
    });

    return sendSuccess(res, "Profile updated", user.toSafeObject());
});

module.exports = { register, login, getMe, updateMe };
