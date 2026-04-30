const Joi = require("joi");
const { sendError } = require("../utils/response");

/**
 * Creates a validation middleware using Joi schema.
 * @param {Joi.Schema} schema - The Joi validation schema
 * @param {"body"|"query"|"params"} target - Which request property to validate
 */
const validate = (schema, target = "body") => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[target], {
            abortEarly: false,     // Collect all errors
            stripUnknown: true,    // Remove unknown fields
            convert: true,         // Convert types (e.g. strings to numbers)
        });

        if (error) {
            const messages = error.details.map((d) => d.message).join(", ");
            return sendError(res, messages, 422);
        }

        req[target] = value; // Replace with sanitized value
        next();
    };
};

// ─── Auth Schemas ──────────────────────────────────────────────────────────────
const registerSchema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required().messages({
        "string.min": "Name must be at least 2 characters",
        "string.max": "Name cannot exceed 50 characters",
        "any.required": "Name is required",
    }),
    email: Joi.string().trim().email().lowercase().required().messages({
        "string.email": "Please provide a valid email",
        "any.required": "Email is required",
    }),
    password: Joi.string().min(6).max(128).required().messages({
        "string.min": "Password must be at least 6 characters",
        "any.required": "Password is required",
    }),
});

const loginSchema = Joi.object({
    email: Joi.string().trim().email().lowercase().required().messages({
        "string.email": "Please provide a valid email",
        "any.required": "Email is required",
    }),
    password: Joi.string().required().messages({
        "any.required": "Password is required",
    }),
});

// ─── Folder Schemas ────────────────────────────────────────────────────────────
const createFolderSchema = Joi.object({
    name: Joi.string().trim().min(1).max(255).required().messages({
        "string.min": "Folder name cannot be empty",
        "string.max": "Folder name cannot exceed 255 characters",
        "any.required": "Folder name is required",
    }),
    parentId: Joi.string().hex().length(24).allow(null, "").optional().messages({
        "string.hex": "parentId must be a valid MongoDB ObjectId",
        "string.length": "parentId must be a valid MongoDB ObjectId",
    }),
    color: Joi.string().max(20).optional(),
});

const renameFolderSchema = Joi.object({
    name: Joi.string().trim().min(1).max(255).required().messages({
        "string.min": "Folder name cannot be empty",
        "any.required": "New folder name is required",
    }),
});

// ─── File Schemas ──────────────────────────────────────────────────────────────
const fileQuerySchema = Joi.object({
    folderId: Joi.string().hex().length(24).allow(null, "").optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    search: Joi.string().trim().max(100).optional(),
    sort: Joi.string().valid("name", "-name", "size", "-size", "createdAt", "-createdAt").optional(),
});

module.exports = {
    validate,
    registerSchema,
    loginSchema,
    createFolderSchema,
    renameFolderSchema,
    fileQuerySchema,
};
