const express = require("express");
const router = express.Router();

const { register, login, getMe, updateMe, setHidePin, verifyHidePin, verifyEmail, resendOTP } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { validate, registerSchema, loginSchema } = require("../middleware/validate");

// Public routes
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOTP);

// Protected routes
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.post("/set-pin", protect, setHidePin);
router.post("/verify-pin", protect, verifyHidePin);

module.exports = router;
