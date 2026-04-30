const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
    {
        filename: {
            type: String,
            required: [true, "Filename is required"],
            trim: true,
        },
        originalName: {
            type: String,
            required: [true, "Original filename is required"],
            trim: true,
        },
        path: {
            type: String,
            required: [true, "File path is required"],
        },
        mimetype: {
            type: String,
            required: [true, "File MIME type is required"],
        },
        size: {
            type: Number,
            required: [true, "File size is required"],
            min: [0, "File size cannot be negative"],
        },
        folderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Folder",
            default: null,
            index: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            index: true,
        },
        isStarred: {
            type: Boolean,
            default: false,
        },
        // Soft delete support (trash system)
        isTrashed: {
            type: Boolean,
            default: false,
            index: true,
        },
        trashedAt: {
            type: Date,
            default: null,
        },
        // Metadata
        extension: {
            type: String,
            default: null,
        },
        downloadCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Compound indices for common queries
fileSchema.index({ userId: 1, folderId: 1, isTrashed: 1 });
fileSchema.index({ userId: 1, isStarred: 1, isTrashed: 1 });
fileSchema.index({ userId: 1, originalName: "text" }); // Text search on file name
fileSchema.index({ originalName: "text" });

const File = mongoose.model("File", fileSchema);
module.exports = File;
