const express = require("express");
const router = express.Router();

const { register, login, getMe, updateMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { validate, registerSchema, loginSchema } = require("../middleware/validate");

// Public routes
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

// Protected routes
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);

module.exports = router;
