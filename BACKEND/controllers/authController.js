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
    // Email cannot be changed
    const allowedFields = ["name", "avatar", "phone"];
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

// ─── POST /api/auth/set-pin ────────────────────────────────────────────────────
// Set or update the 4-digit hide/unhide PIN
const setHidePin = asyncHandler(async (req, res) => {
    const { pin } = req.body;

    if (!pin || !/^\d{4}$/.test(String(pin))) {
        return sendError(res, "PIN must be exactly 4 digits", 400);
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        return sendError(res, "User not found", 404);
    }

    user.hidePin = String(pin);
    await user.save(); // pre-save hook will hash it

    return sendSuccess(res, user.hidePinSet ? "PIN updated successfully" : "PIN set successfully", {
        hidePinSet: true,
    });
});

// ─── POST /api/auth/verify-pin ─────────────────────────────────────────────────
// Verify the 4-digit hide/unhide PIN
const verifyHidePin = asyncHandler(async (req, res) => {
    const { pin } = req.body;

    if (!pin || !/^\d{4}$/.test(String(pin))) {
        return sendError(res, "PIN must be exactly 4 digits", 400);
    }

    const user = await User.findById(req.user._id).select("+hidePin");
    if (!user) {
        return sendError(res, "User not found", 404);
    }

    if (!user.hidePinSet || !user.hidePin) {
        return sendError(res, "No PIN has been set. Please set a PIN first.", 400);
    }

    const isMatch = await user.compareHidePin(String(pin));
    if (!isMatch) {
        return sendError(res, "Incorrect PIN", 401);
    }

    return sendSuccess(res, "PIN verified", { verified: true });
});

module.exports = { register, login, getMe, updateMe, setHidePin, verifyHidePin };
