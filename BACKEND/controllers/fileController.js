const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const asyncHandler = require("../middleware/asyncHandler");
const File = require("../models/File");
const Folder = require("../models/Folder");
const User = require("../models/User");
const { sendSuccess, sendCreated, sendError, sendPaginated } = require("../utils/response");
const {
    deleteLocalFile,
    getExtension,
    buildFileUrl,
    getPagination,
    buildPaginationMeta,
} = require("../utils/fileUtils");

// ─── POST /api/files/upload ────────────────────────────────────────────────────
const uploadFile = asyncHandler(async (req, res) => {
    if (!req.file) {
        return sendError(res, "No file provided. Use field name 'file'", 400);
    }

    const { folderId } = req.body;

    // Validate folder if provided
    if (folderId) {
        const folder = await Folder.findOne({
            _id: folderId,
            userId: req.user._id,
            isTrashed: false,
        });
        if (!folder) {
            // Clean up uploaded file
            deleteLocalFile(req.file.path);
            return sendError(res, "Folder not found or access denied", 404);
        }
    }

    const ext = getExtension(req.file.originalname);

    // Create file record
    const file = await File.create({
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
        extension: ext,
        folderId: folderId || null,
        userId: req.user._id,
    });

    // Update user's storage usage
    await User.findByIdAndUpdate(req.user._id, {
        $inc: { storageUsed: req.file.size },
    });

    const fileUrl = buildFileUrl(req, req.file.filename);

    return sendCreated(res, "File uploaded successfully", {
        file: {
            ...file.toObject(),
            url: fileUrl,
        },
    });
});

// ─── GET /api/files ────────────────────────────────────────────────────────────
const getFiles = asyncHandler(async (req, res) => {
    const { folderId, search, sort } = req.query;
    const { page, limit, skip } = getPagination(req.query);

    const query = {
        userId: req.user._id,
        isTrashed: false,
    };

    // Filter by folder (null = root)
    if (folderId === "null" || folderId === "" || !folderId) {
        query.folderId = null;
    } else {
        query.folderId = folderId;
    }

    // Full-text search on original filename
    if (search && search.trim()) {
        query.originalName = { $regex: search.trim(), $options: "i" };
    }

    // Sorting
    const sortMap = {
        name: { originalName: 1 },
        "-name": { originalName: -1 },
        size: { size: 1 },
        "-size": { size: -1 },
        createdAt: { createdAt: 1 },
        "-createdAt": { createdAt: -1 },
    };
    const sortOption = sortMap[sort] || { createdAt: -1 };

    const [files, total] = await Promise.all([
        File.find(query).sort(sortOption).skip(skip).limit(limit),
        File.countDocuments(query),
    ]);

    // Append public URL to each file
    const filesWithUrl = files.map((f) => ({
        ...f.toObject(),
        url: buildFileUrl(req, f.filename),
    }));

    return sendPaginated(
        res,
        "Files fetched",
        { files: filesWithUrl },
        buildPaginationMeta(total, page, limit)
    );
});

// ─── GET /api/files/:id ────────────────────────────────────────────────────────
const getFileById = asyncHandler(async (req, res) => {
    const file = await File.findOne({
        _id: req.params.id,
        userId: req.user._id,
        isTrashed: false,
    });

    if (!file) {
        return sendError(res, "File not found", 404);
    }

    return sendSuccess(res, "File fetched", {
        file: {
            ...file.toObject(),
            url: buildFileUrl(req, file.filename),
        },
    });
});

// ─── GET /api/files/:id/download ──────────────────────────────────────────────
const downloadFile = asyncHandler(async (req, res) => {
    const file = await File.findOne({
        _id: req.params.id,
        userId: req.user._id,
        isTrashed: false,
    });

    if (!file) {
        return sendError(res, "File not found", 404);
    }

    const absolutePath = path.isAbsolute(file.path)
        ? file.path
        : path.join(__dirname, "../", file.path);

    // Increment download count
    await File.findByIdAndUpdate(file._id, { $inc: { downloadCount: 1 } });

    res.download(absolutePath, file.originalName, (err) => {
        if (err) {
            console.error("Download error:", err.message);
            if (!res.headersSent) {
                return sendError(res, "Failed to download file", 500);
            }
        }
    });
});

// ─── PATCH /api/files/:id/star ─────────────────────────────────────────────────
const toggleStar = asyncHandler(async (req, res) => {
    const file = await File.findOne({
        _id: req.params.id,
        userId: req.user._id,
        isTrashed: false,
    });

    if (!file) {
        return sendError(res, "File not found", 404);
    }

    file.isStarred = !file.isStarred;
    await file.save();

    return sendSuccess(res, file.isStarred ? "File starred" : "File unstarred", { file });
});

// ─── PATCH /api/files/:id/hide ─────────────────────────────────────────────────
const toggleHide = asyncHandler(async (req, res) => {
    const file = await File.findOne({
        _id: req.params.id,
        userId: req.user._id,
        isTrashed: false,
    });

    if (!file) {
        return sendError(res, "File not found", 404);
    }

    file.isHidden = !file.isHidden;
    await file.save();

    return sendSuccess(res, file.isHidden ? "File hidden" : "File unhidden", { file });
});

// ─── PATCH /api/files/:id/pin ──────────────────────────────────────────────────
const togglePin = asyncHandler(async (req, res) => {
    const file = await File.findOne({
        _id: req.params.id,
        userId: req.user._id,
        isTrashed: false,
    });

    if (!file) {
        return sendError(res, "File not found", 404);
    }

    file.isPinned = !file.isPinned;
    await file.save();

    return sendSuccess(res, file.isPinned ? "File pinned" : "File unpinned", { file });
});

// ─── PATCH /api/files/:id/rename ──────────────────────────────────────────────
const renameFile = asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name || !name.trim()) {
        return sendError(res, "Name is required", 400);
    }

    const file = await File.findOne({
        _id: req.params.id,
        userId: req.user._id,
        isTrashed: false,
    });

    if (!file) {
        return sendError(res, "File not found", 404);
    }

    file.originalName = name.trim();
    await file.save();

    return sendSuccess(res, "File renamed", { file });
});

// ─── POST /api/files/:id/copy ─────────────────────────────────────────────────
// Copy file to a target folder (or root)
const copyFile = asyncHandler(async (req, res) => {
    const { targetFolderId } = req.body;

    const file = await File.findOne({
        _id: req.params.id,
        userId: req.user._id,
        isTrashed: false,
    });

    if (!file) {
        return sendError(res, "File not found", 404);
    }

    // Validate target folder if provided
    if (targetFolderId && targetFolderId !== "null") {
        const folder = await Folder.findOne({
            _id: targetFolderId,
            userId: req.user._id,
            isTrashed: false,
        });
        if (!folder) {
            return sendError(res, "Target folder not found", 404);
        }
    }

    // Physically copy the file
    const originalAbsPath = path.isAbsolute(file.path)
        ? file.path
        : path.join(__dirname, "../", file.path);

    const ext = path.extname(file.filename);
    const newFilename = `${Date.now()}-copy-${file.filename}`;
    const newFilePath = path.join(path.dirname(originalAbsPath), newFilename);

    try {
        fs.copyFileSync(originalAbsPath, newFilePath);
    } catch (err) {
        return sendError(res, "Failed to copy file on disk", 500);
    }

    const relativePath = path.relative(
        path.join(__dirname, "../"),
        newFilePath
    ).replace(/\\/g, "/");

    // Create new file record
    const newFile = await File.create({
        filename: newFilename,
        originalName: `Copy of ${file.originalName}`,
        path: relativePath,
        mimetype: file.mimetype,
        size: file.size,
        extension: file.extension,
        folderId: (targetFolderId && targetFolderId !== "null") ? targetFolderId : file.folderId,
        userId: req.user._id,
    });

    // Update user's storage usage
    await User.findByIdAndUpdate(req.user._id, {
        $inc: { storageUsed: file.size },
    });

    return sendCreated(res, "File copied successfully", {
        file: {
            ...newFile.toObject(),
            url: buildFileUrl(req, newFilename),
        },
    });
});

// ─── POST /api/files/:id/share-token ──────────────────────────────────────────
// Generate or return existing share token for QR code
const generateShareToken = asyncHandler(async (req, res) => {
    const file = await File.findOne({
        _id: req.params.id,
        userId: req.user._id,
        isTrashed: false,
    });

    if (!file) {
        return sendError(res, "File not found", 404);
    }

    if (!file.shareToken) {
        file.shareToken = crypto.randomBytes(32).toString("hex");
        await file.save();
    }

    return sendSuccess(res, "Share token generated", {
        shareToken: file.shareToken,
        shareUrl: `${process.env.CLIENT_URL || "http://localhost:5173"}/share/file/${file.shareToken}`,
    });
});

// ─── GET /api/files/shared/:token ─────────────────────────────────────────────
// Public endpoint — no auth needed. Returns file info for QR code scan
const getSharedFile = asyncHandler(async (req, res) => {
    const file = await File.findOne({
        shareToken: req.params.token,
        isTrashed: false,
    }).populate("userId", "name");

    if (!file) {
        return sendError(res, "Shared file not found or link expired", 404);
    }

    return sendSuccess(res, "Shared file fetched", {
        file: {
            _id: file._id,
            originalName: file.originalName,
            mimetype: file.mimetype,
            size: file.size,
            extension: file.extension,
            url: buildFileUrl(req, file.filename),
            sharedBy: file.userId?.name,
            createdAt: file.createdAt,
        },
    });
});

// ─── PATCH /api/files/:id/move ─────────────────────────────────────────────────
const moveFile = asyncHandler(async (req, res) => {
    const { targetFolderId } = req.body;

    const file = await File.findOne({
        _id: req.params.id,
        userId: req.user._id,
        isTrashed: false,
    });

    if (!file) {
        return sendError(res, "File not found", 404);
    }

    // Validate target folder
    if (targetFolderId) {
        const folder = await Folder.findOne({
            _id: targetFolderId,
            userId: req.user._id,
            isTrashed: false,
        });
        if (!folder) {
            return sendError(res, "Target folder not found", 404);
        }
    }

    file.folderId = targetFolderId || null;
    await file.save();

    return sendSuccess(res, "File moved", { file });
});

// ─── DELETE /api/files/:id ─────────────────────────────────────────────────────
// Soft delete: moves file to trash
const deleteFile = asyncHandler(async (req, res) => {
    const file = await File.findOne({
        _id: req.params.id,
        userId: req.user._id,
        isTrashed: false,
    });

    if (!file) {
        return sendError(res, "File not found", 404);
    }

    file.isTrashed = true;
    file.trashedAt = new Date();
    await file.save();

    return sendSuccess(res, "File moved to trash");
});

// ─── DELETE /api/files/:id/permanent ──────────────────────────────────────────
const permanentDeleteFile = asyncHandler(async (req, res) => {
    const file = await File.findOne({
        _id: req.params.id,
        userId: req.user._id,
    });

    if (!file) {
        return sendError(res, "File not found", 404);
    }

    // Remove from disk
    deleteLocalFile(file.path);

    // Update user's storage usage
    await User.findByIdAndUpdate(req.user._id, {
        $inc: { storageUsed: -file.size },
    });

    await file.deleteOne();

    return sendSuccess(res, "File permanently deleted");
});

// ─── POST /api/files/:id/restore ──────────────────────────────────────────────
const restoreFile = asyncHandler(async (req, res) => {
    const file = await File.findOne({
        _id: req.params.id,
        userId: req.user._id,
        isTrashed: true,
    });

    if (!file) {
        return sendError(res, "File not found in trash", 404);
    }

    file.isTrashed = false;
    file.trashedAt = null;
    await file.save();

    return sendSuccess(res, "File restored from trash");
});

// ─── GET /api/files/starred ────────────────────────────────────────────────────
const getStarredFiles = asyncHandler(async (req, res) => {
    const files = await File.find({
        userId: req.user._id,
        isStarred: true,
        isTrashed: false,
    }).sort({ updatedAt: -1 });

    const filesWithUrl = files.map((f) => ({
        ...f.toObject(),
        url: buildFileUrl(req, f.filename),
    }));

    return sendSuccess(res, "Starred files fetched", { files: filesWithUrl });
});

// ─── GET /api/files/trash ──────────────────────────────────────────────────────
const getTrashFiles = asyncHandler(async (req, res) => {
    const files = await File.find({
        userId: req.user._id,
        isTrashed: true,
    }).sort({ trashedAt: -1 });

    const filesWithUrl = files.map((f) => ({
        ...f.toObject(),
        url: buildFileUrl(req, f.filename),
    }));

    return sendSuccess(res, "Trash fetched", { files: filesWithUrl });
});

// ─── GET /api/files/search ────────────────────────────────────────────────────
const searchFiles = asyncHandler(async (req, res) => {
    const { q } = req.query;
    if (!q || !q.trim()) {
        return sendError(res, "Search query 'q' is required", 400);
    }

    const files = await File.find({
        userId: req.user._id,
        isTrashed: false,
        originalName: { $regex: q.trim(), $options: "i" },
    }).limit(50);

    const filesWithUrl = files.map((f) => ({
        ...f.toObject(),
        url: buildFileUrl(req, f.filename),
    }));

    return sendSuccess(res, `Search results for "${q}"`, { files: filesWithUrl });
});

module.exports = {
    uploadFile,
    getFiles,
    getFileById,
    downloadFile,
    toggleStar,
    toggleHide,
    togglePin,
    renameFile,
    copyFile,
    generateShareToken,
    getSharedFile,
    moveFile,
    deleteFile,
    permanentDeleteFile,
    restoreFile,
    getStarredFiles,
    getTrashFiles,
    searchFiles,
};
