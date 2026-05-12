const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/User");
const { generateToken } = require("../utils/generateToken");
const { sendSuccess, sendCreated, sendError } = require("../utils/response");
const { sendOTPEmail } = require("../utils/sendEmail");

// ─── POST /api/auth/register ───────────────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Check if email already taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return sendError(res, "An account with this email already exists", 409);
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    console.log(`\n[AUTH] Generated OTP for ${email}: ${otp}\n`);

    const user = await User.create({ 
        name, 
        email, 
        password,
        otp,
        otpExpiry,
        isEmailVerified: false
    });

    sendOTPEmail(email, otp);

    return sendCreated(res, "Account created successfully. Please verify your email.", {
        email: user.email,
        is_email_verified: user.isEmailVerified,
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

    if (!user.isEmailVerified) {
        return sendError(res, "Please verify your email before logging in", 403, {
            is_email_verified: false
        });
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

// ─── POST /api/auth/verify-email ───────────────────────────────────────────────
const verifyEmail = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return sendError(res, "Email and OTP are required", 400);
    }

    const user = await User.findOne({ email }).select("+otp +otpExpiry");
    if (!user) {
        return sendError(res, "User not found", 404);
    }

    if (user.isEmailVerified) {
        return sendError(res, "Email is already verified", 400);
    }

    if (user.otp !== otp) {
        return sendError(res, "Invalid OTP", 400);
    }

    if (user.otpExpiry < new Date()) {
        return sendError(res, "OTP has expired", 400);
    }

    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return sendSuccess(res, "Email verified successfully", {
        is_email_verified: user.isEmailVerified,
    });
});

// ─── POST /api/auth/resend-otp ─────────────────────────────────────────────────
const resendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return sendError(res, "Email is required", 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
        return sendError(res, "User not found", 404);
    }

    if (user.isEmailVerified) {
        return sendError(res, "Email is already verified", 400);
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    console.log(`\n[AUTH] Resent OTP for ${email}: ${otp}\n`);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    sendOTPEmail(email, otp);

    return sendSuccess(res, "OTP sent successfully", { otp });
});

module.exports = { register, login, getMe, updateMe, setHidePin, verifyHidePin, verifyEmail, resendOTP };
