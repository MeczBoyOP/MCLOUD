const { sendError } = require("../utils/response");

/**
 * Global error handler middleware.
 * Must have 4 parameters (err, req, res, next) to be recognized by Express.
 */
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Mongoose bad ObjectId
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ID format: ${err.value}`;
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue)[0];
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((e) => e.message)
            .join(", ");
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired";
    }

    // Multer file size error
    if (err.code === "LIMIT_FILE_SIZE") {
        statusCode = 413;
        const maxMB = Math.round((parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024) / (1024 * 1024));
        message = `File too large. Maximum size is ${maxMB}MB`;
    }

    // Multer unexpected field error
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
        statusCode = 400;
        message = "Unexpected file field. Use 'file' as the field name";
    }

    // Log errors in development
    if (process.env.NODE_ENV === "development") {
        console.error("❌ Error:", err.message);
        console.error(err.stack);
    }

    return sendError(res, message, statusCode);
};

module.exports = errorHandler;
