const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");
const User = require("../models/User");
const { sendError } = require("../utils/response");

/**
 * Protect routes — verifies JWT and attaches user to req.user
 */
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Support Bearer token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }
    // Also support token in cookie (optional for web apps)
    else if (req.cookies?.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return sendError(res, "Access denied. No token provided.", 401);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return sendError(res, "User not found. Token is invalid.", 401);
        }

        if (!user.isActive) {
            return sendError(res, "Your account has been deactivated.", 401);
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return sendError(res, "Session expired. Please login again.", 401);
        }
        return sendError(res, "Invalid token.", 401);
    }
});

/**
 * Restrict to specific roles
 * Usage: authorize("admin") or authorize("admin", "user")
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return sendError(
                res,
                `Access denied. Required role: ${roles.join(" or ")}`,
                403
            );
        }
        next();
    };
};

module.exports = { protect, authorize };
