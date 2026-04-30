const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Folder name is required"],
            trim: true,
            minlength: [1, "Folder name cannot be empty"],
            maxlength: [255, "Folder name cannot exceed 255 characters"],
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            index: true,
        },
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Folder",
            default: null,
            index: true,
        },
        isStarred: {
            type: Boolean,
            default: false,
        },
        // Soft delete support
        isTrashed: {
            type: Boolean,
            default: false,
            index: true,
        },
        trashedAt: {
            type: Date,
            default: null,
        },
        color: {
            type: String,
            default: null, // Optional folder color
        },
    },
    {
        timestamps: true,
    }
);

// Compound index: user's folders with parent filter
folderSchema.index({ userId: 1, parentId: 1, isTrashed: 1 });
folderSchema.index({ userId: 1, isStarred: 1, isTrashed: 1 });

const Folder = mongoose.model("Folder", folderSchema);
module.exports = Folder;
