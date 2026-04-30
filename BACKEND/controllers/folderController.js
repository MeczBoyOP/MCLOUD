const asyncHandler = require("../middleware/asyncHandler");
const Folder = require("../models/Folder");
const File = require("../models/File");
const { sendSuccess, sendCreated, sendError } = require("../utils/response");
const { deleteLocalFile } = require("../utils/fileUtils");

// ─── POST /api/folders ─────────────────────────────────────────────────────────
const createFolder = asyncHandler(async (req, res) => {
    const { name, parentId, color } = req.body;

    // If parentId provided, verify it belongs to this user and is not trashed
    if (parentId) {
        const parent = await Folder.findOne({
            _id: parentId,
            userId: req.user._id,
            isTrashed: false,
        });
        if (!parent) {
            return sendError(res, "Parent folder not found or access denied", 404);
        }
    }

    const folder = await Folder.create({
        name,
        userId: req.user._id,
        parentId: parentId || null,
        color: color || null,
    });

    return sendCreated(res, "Folder created successfully", { folder });
});

// ─── GET /api/folders ──────────────────────────────────────────────────────────
// Returns folders in a given parent (or root-level if no parentId)
const getFolders = asyncHandler(async (req, res) => {
    const { parentId, search } = req.query;

    const query = {
        userId: req.user._id,
        isTrashed: false,
    };

    // Root level: parentId = null or not provided
    if (parentId === "null" || parentId === "" || !parentId) {
        query.parentId = null;
    } else {
        // Validate folder exists and belongs to user
        const parent = await Folder.findOne({
            _id: parentId,
            userId: req.user._id,
            isTrashed: false,
        });
        if (!parent) {
            return sendError(res, "Folder not found", 404);
        }
        query.parentId = parentId;
    }

    // Optional search filter
    if (search) {
        query.name = { $regex: search.trim(), $options: "i" };
    }

    const folders = await Folder.find(query).sort({ createdAt: -1 });

    return sendSuccess(res, "Folders fetched", { folders });
});

// ─── GET /api/folders/:id ──────────────────────────────────────────────────────
const getFolderById = asyncHandler(async (req, res) => {
    const folder = await Folder.findOne({
        _id: req.params.id,
        userId: req.user._id,
        isTrashed: false,
    });

    if (!folder) {
        return sendError(res, "Folder not found", 404);
    }

    return sendSuccess(res, "Folder fetched", { folder });
});

// ─── GET /api/folders/:id/breadcrumb ──────────────────────────────────────────
// Returns ancestor chain for building breadcrumb navigation
const getBreadcrumb = asyncHandler(async (req, res) => {
    const folderId = req.params.id;
    const breadcrumb = [];

    let current = await Folder.findOne({
        _id: folderId,
        userId: req.user._id,
        isTrashed: false,
    });

    if (!current) {
        return sendError(res, "Folder not found", 404);
    }

    // Walk up the parent chain
    while (current) {
        breadcrumb.unshift({ id: current._id, name: current.name });
        if (!current.parentId) break;
        current = await Folder.findOne({
            _id: current.parentId,
            userId: req.user._id,
        });
    }

    return sendSuccess(res, "Breadcrumb fetched", { breadcrumb });
});

// ─── PATCH /api/folders/:id ────────────────────────────────────────────────────
const renameFolder = asyncHandler(async (req, res) => {
    const { name } = req.body;

    const folder = await Folder.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id, isTrashed: false },
        { name },
        { new: true, runValidators: true }
    );

    if (!folder) {
        return sendError(res, "Folder not found", 404);
    }

    return sendSuccess(res, "Folder renamed", { folder });
});

// ─── PATCH /api/folders/:id/star ──────────────────────────────────────────────
const toggleStar = asyncHandler(async (req, res) => {
    const folder = await Folder.findOne({
        _id: req.params.id,
        userId: req.user._id,
        isTrashed: false,
    });

    if (!folder) {
        return sendError(res, "Folder not found", 404);
    }

    folder.isStarred = !folder.isStarred;
    await folder.save();

    return sendSuccess(res, folder.isStarred ? "Folder starred" : "Folder unstarred", {
        folder,
    });
});

// ─── PATCH /api/folders/:id/move ──────────────────────────────────────────────
const moveFolder = asyncHandler(async (req, res) => {
    const { targetFolderId } = req.body;
    const folderId = req.params.id;

    if (folderId === targetFolderId) {
        return sendError(res, "Cannot move a folder into itself", 400);
    }

    const folder = await Folder.findOne({
        _id: folderId,
        userId: req.user._id,
        isTrashed: false,
    });

    if (!folder) {
        return sendError(res, "Folder not found", 404);
    }

    // Verify target folder exists and belongs to user if it's not root
    if (targetFolderId && targetFolderId !== "null") {
        const target = await Folder.findOne({
            _id: targetFolderId,
            userId: req.user._id,
            isTrashed: false,
        });
        if (!target) {
            return sendError(res, "Target folder not found", 404);
        }

        // Prevent circular reference: check if target is a descendant of folder
        const descendantIds = await getAllDescendantIds(folder._id, req.user._id);
        if (descendantIds.some(id => id.toString() === targetFolderId)) {
            return sendError(res, "Cannot move a folder into its own descendant", 400);
        }
    }

    folder.parentId = (targetFolderId && targetFolderId !== "null") ? targetFolderId : null;
    await folder.save();

    return sendSuccess(res, "Folder moved successfully", { folder });
});
// Soft delete: moves folder (and all descendants) to trash
const deleteFolder = asyncHandler(async (req, res) => {
    const folder = await Folder.findOne({
        _id: req.params.id,
        userId: req.user._id,
        isTrashed: false,
    });

    if (!folder) {
        return sendError(res, "Folder not found", 404);
    }

    // Recursively collect all descendant folder IDs
    const allFolderIds = await getAllDescendantIds(folder._id, req.user._id);
    allFolderIds.push(folder._id);

    const now = new Date();

    // Soft delete all descendant folders
    await Folder.updateMany(
        { _id: { $in: allFolderIds }, userId: req.user._id },
        { isTrashed: true, trashedAt: now }
    );

    // Soft delete all files inside these folders
    await File.updateMany(
        { folderId: { $in: allFolderIds }, userId: req.user._id },
        { isTrashed: true, trashedAt: now }
    );

    return sendSuccess(res, "Folder moved to trash");
});

// ─── DELETE /api/folders/:id/permanent ────────────────────────────────────────
// Permanently delete folder and all its contents
const permanentDeleteFolder = asyncHandler(async (req, res) => {
    const folder = await Folder.findOne({
        _id: req.params.id,
        userId: req.user._id,
    });

    if (!folder) {
        return sendError(res, "Folder not found", 404);
    }

    // Collect all descendant folder IDs
    const allFolderIds = await getAllDescendantIds(folder._id, req.user._id);
    allFolderIds.push(folder._id);

    // Delete all files (and their local files) in these folders
    const files = await File.find({ folderId: { $in: allFolderIds }, userId: req.user._id });
    for (const file of files) {
        deleteLocalFile(file.path);
    }
    await File.deleteMany({ folderId: { $in: allFolderIds }, userId: req.user._id });

    // Delete all folders
    await Folder.deleteMany({ _id: { $in: allFolderIds }, userId: req.user._id });

    return sendSuccess(res, "Folder permanently deleted");
});

// ─── POST /api/folders/:id/restore ────────────────────────────────────────────
const restoreFolder = asyncHandler(async (req, res) => {
    const folder = await Folder.findOne({
        _id: req.params.id,
        userId: req.user._id,
        isTrashed: true,
    });

    if (!folder) {
        return sendError(res, "Folder not found in trash", 404);
    }

    const allFolderIds = await getAllDescendantIds(folder._id, req.user._id);
    allFolderIds.push(folder._id);

    await Folder.updateMany(
        { _id: { $in: allFolderIds }, userId: req.user._id },
        { isTrashed: false, trashedAt: null }
    );

    await File.updateMany(
        { folderId: { $in: allFolderIds }, userId: req.user._id },
        { isTrashed: false, trashedAt: null }
    );

    return sendSuccess(res, "Folder restored from trash");
});

// ─── GET /api/folders/starred ─────────────────────────────────────────────────
const getStarredFolders = asyncHandler(async (req, res) => {
    const folders = await Folder.find({
        userId: req.user._id,
        isStarred: true,
        isTrashed: false,
    }).sort({ updatedAt: -1 });

    return sendSuccess(res, "Starred folders fetched", { folders });
});

// ─── GET /api/folders/trash ───────────────────────────────────────────────────
const getTrashFolders = asyncHandler(async (req, res) => {
    const folders = await Folder.find({
        userId: req.user._id,
        isTrashed: true,
    }).sort({ trashedAt: -1 });

    return sendSuccess(res, "Trash folders fetched", { folders });
});

// ─── Helpers ───────────────────────────────────────────────────────────────────
/**
 * Recursively find all descendant folder IDs for a given folder.
 * Uses BFS to avoid deep recursion.
 */
const getAllDescendantIds = async (folderId, userId) => {
    const ids = [];
    const queue = [folderId];

    while (queue.length > 0) {
        const currentId = queue.shift();
        const children = await Folder.find(
            { parentId: currentId, userId },
            { _id: 1 }
        );
        for (const child of children) {
            ids.push(child._id);
            queue.push(child._id);
        }
    }

    return ids;
};

module.exports = {
    createFolder,
    getFolders,
    getFolderById,
    getBreadcrumb,
    renameFolder,
    toggleStar,
    moveFolder,
    deleteFolder,
    permanentDeleteFolder,
    restoreFolder,
    getStarredFolders,
    getTrashFolders,
};
