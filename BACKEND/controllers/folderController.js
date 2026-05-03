const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
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

// ─── PATCH /api/folders/:id/hide ──────────────────────────────────────────────
const toggleHide = asyncHandler(async (req, res) => {
    const folder = await Folder.findOne({
        _id: req.params.id,
        userId: req.user._id,
        isTrashed: false,
    });

    if (!folder) {
        return sendError(res, "Folder not found", 404);
    }

    folder.isHidden = !folder.isHidden;
    await folder.save();

    return sendSuccess(res, folder.isHidden ? "Folder hidden" : "Folder unhidden", { folder });
});

// ─── PATCH /api/folders/:id/pin ───────────────────────────────────────────────
const togglePin = asyncHandler(async (req, res) => {
    const folder = await Folder.findOne({
        _id: req.params.id,
        userId: req.user._id,
        isTrashed: false,
    });

    if (!folder) {
        return sendError(res, "Folder not found", 404);
    }

    folder.isPinned = !folder.isPinned;
    await folder.save();

    return sendSuccess(res, folder.isPinned ? "Folder pinned" : "Folder unpinned", { folder });
});

// ─── POST /api/folders/:id/share-token ────────────────────────────────────────
const generateShareToken = asyncHandler(async (req, res) => {
    const folder = await Folder.findOne({
        _id: req.params.id,
        userId: req.user._id,
        isTrashed: false,
    });

    if (!folder) {
        return sendError(res, "Folder not found", 404);
    }

    if (!folder.shareToken) {
        folder.shareToken = crypto.randomBytes(32).toString("hex");
        await folder.save();
    }

    return sendSuccess(res, "Share token generated", {
        shareToken: folder.shareToken,
        shareUrl: `${process.env.CLIENT_URL || "http://localhost:5173"}/share/folder/${folder.shareToken}`,
    });
});

// ─── GET /api/folders/shared/:token ───────────────────────────────────────────
// Public — no auth. Returns folder with its non-hidden contents.
const getSharedFolder = asyncHandler(async (req, res) => {
    const folder = await Folder.findOne({
        shareToken: req.params.token,
        isTrashed: false,
    }).populate("userId", "name");

    if (!folder) {
        return sendError(res, "Shared folder not found or link expired", 404);
    }

    // Return sub-folders and files that are NOT hidden
    const [subFolders, files] = await Promise.all([
        Folder.find({ parentId: folder._id, isTrashed: false }),
        File.find({ folderId: folder._id, isTrashed: false }),
    ]);

    // Ensure all subfolders have a shareToken
    const mappedSubFolders = await Promise.all(subFolders.map(async f => {
        if (!f.shareToken) {
            f.shareToken = crypto.randomBytes(32).toString("hex");
            await f.save();
        }
        return {
            _id: f._id,
            name: f.name,
            isHidden: f.isHidden,
            createdAt: f.createdAt,
            shareToken: f.shareToken
        };
    }));

    // Ensure all files have a shareToken
    const mappedFiles = await Promise.all(files.map(async f => {
        if (!f.shareToken) {
            f.shareToken = crypto.randomBytes(32).toString("hex");
            await f.save();
        }
        return {
            _id: f._id,
            originalName: f.originalName,
            mimetype: f.mimetype,
            size: f.size,
            extension: f.extension,
            isHidden: f.isHidden,
            createdAt: f.createdAt,
            shareToken: f.shareToken
        };
    }));

    return sendSuccess(res, "Shared folder fetched", {
        folder: {
            _id: folder._id,
            name: folder.name,
            sharedBy: folder.userId?.name,
            createdAt: folder.createdAt,
        },
        subFolders: mappedSubFolders,
        files: mappedFiles,
    });
});

// ─── POST /api/folders/:id/copy ───────────────────────────────────────────────
const copyFolder = asyncHandler(async (req, res) => {
    const { targetFolderId } = req.body;
    const sourceId = req.params.id;
    const userId = req.user._id;

    // Validate target folder if provided
    if (targetFolderId && targetFolderId !== "null") {
        const target = await Folder.findOne({
            _id: targetFolderId,
            userId,
            isTrashed: false,
        });
        if (!target) {
            return sendError(res, "Target folder not found", 404);
        }

        // Prevent copying into itself or its descendant
        if (sourceId === targetFolderId) {
            return sendError(res, "Cannot copy a folder into itself", 400);
        }
        const descendantIds = await getAllDescendantIds(sourceId, userId);
        if (descendantIds.some(id => id.toString() === targetFolderId)) {
            return sendError(res, "Cannot copy a folder into its own descendant", 400);
        }
    }

    const duplicateFolderRecursive = async (currSourceId, currTargetParentId, isTopLevel) => {
        const sourceFolder = await Folder.findOne({ _id: currSourceId, userId, isTrashed: false });
        if (!sourceFolder) return null;

        const newName = isTopLevel ? `Copy of ${sourceFolder.name}` : sourceFolder.name;

        const newFolder = await Folder.create({
            name: newName,
            parentId: (currTargetParentId && currTargetParentId !== "null") ? currTargetParentId : null,
            userId,
            color: sourceFolder.color,
            isHidden: sourceFolder.isHidden,
            isPinned: false,
            isStarred: false,
        });

        // Copy files
        const files = await File.find({ folderId: currSourceId, userId, isTrashed: false });
        for (const f of files) {
            const originalAbsPath = path.isAbsolute(f.path)
                ? f.path
                : path.join(__dirname, "../", f.path);
            
            const newFilename = `${Date.now()}-copy-${f.filename}`;
            const newFilePath = path.join(path.dirname(originalAbsPath), newFilename);
            
            try {
                fs.copyFileSync(originalAbsPath, newFilePath);
                const relativePath = path.relative(
                    path.join(__dirname, "../"),
                    newFilePath
                ).replace(/\\/g, "/");
                
                await File.create({
                    filename: newFilename,
                    originalName: f.originalName,
                    path: relativePath,
                    mimetype: f.mimetype,
                    size: f.size,
                    extension: f.extension,
                    folderId: newFolder._id,
                    userId,
                    isHidden: f.isHidden,
                    isStarred: false,
                    isPinned: false
                });
            } catch (err) {
                console.error("Failed to copy file on disk during folder copy", err);
            }
        }

        // Recursively copy subfolders
        const subfolders = await Folder.find({ parentId: currSourceId, userId, isTrashed: false });
        for (const sub of subfolders) {
            await duplicateFolderRecursive(sub._id, newFolder._id, false);
        }

        return newFolder;
    };

    const newFolder = await duplicateFolderRecursive(sourceId, targetFolderId, true);
    if (!newFolder) {
        return sendError(res, "Source folder not found", 404);
    }

    return sendSuccess(res, "Folder copied successfully", { folder: newFolder });
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
    toggleHide,
    togglePin,
    generateShareToken,
    getSharedFolder,
    moveFolder,
    deleteFolder,
    permanentDeleteFolder,
    restoreFolder,
    getStarredFolders,
    getTrashFolders,
    copyFolder,
};
