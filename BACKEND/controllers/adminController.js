const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/User");
const File = require("../models/File");
const Folder = require("../models/Folder");
const { sendSuccess, sendError } = require("../utils/response");
const { deleteLocalFile } = require("../utils/fileUtils");

// ─── GET /api/admin/users ──────────────────────────────────────────────────────
const getAllUsers = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const query = {};
    if (search.trim()) {
        query.$or = [
            { name: { $regex: search.trim(), $options: "i" } },
            { email: { $regex: search.trim(), $options: "i" } },
        ];
    }

    const [users, total] = await Promise.all([
        User.find(query).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments(query),
    ]);

    return res.status(200).json({
        success: true,
        message: "Users fetched",
        data: { users },
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    });
});

// ─── GET /api/admin/users/:id ─────────────────────────────────────────────────
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
        return sendError(res, "User not found", 404);
    }

    const [fileCount, folderCount] = await Promise.all([
        File.countDocuments({ userId: user._id, isTrashed: false }),
        Folder.countDocuments({ userId: user._id, isTrashed: false }),
    ]);

    return sendSuccess(res, "User fetched", {
        user,
        stats: { fileCount, folderCount },
    });
});

// ─── PATCH /api/admin/users/:id/status ────────────────────────────────────────
const toggleUserStatus = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return sendError(res, "User not found", 404);
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString()) {
        return sendError(res, "You cannot deactivate your own account", 400);
    }

    user.isActive = !user.isActive;
    await user.save();

    return sendSuccess(
        res,
        user.isActive ? "User activated" : "User deactivated",
        { user: user.toSafeObject() }
    );
});

// ─── PATCH /api/admin/users/:id/role ─────────────────────────────────────────
const changeUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
        return sendError(res, "Role must be 'user' or 'admin'", 400);
    }

    const user = await User.findById(req.params.id);
    if (!user) {
        return sendError(res, "User not found", 404);
    }

    if (user._id.toString() === req.user._id.toString()) {
        return sendError(res, "You cannot change your own role", 400);
    }

    user.role = role;
    await user.save();

    return sendSuccess(res, `User role updated to '${role}'`, {
        user: user.toSafeObject(),
    });
});

// ─── DELETE /api/admin/users/:id ──────────────────────────────────────────────
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return sendError(res, "User not found", 404);
    }

    if (user._id.toString() === req.user._id.toString()) {
        return sendError(res, "You cannot delete your own account", 400);
    }

    // Delete all files from disk
    const files = await File.find({ userId: user._id });
    for (const file of files) {
        deleteLocalFile(file.path);
    }

    // Delete all DB records
    await File.deleteMany({ userId: user._id });
    await Folder.deleteMany({ userId: user._id });
    await user.deleteOne();

    return sendSuccess(res, "User and all their data permanently deleted");
});

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
const getSystemStats = asyncHandler(async (req, res) => {
    const [
        totalUsers,
        activeUsers,
        totalFiles,
        totalFolders,
        storageResult,
    ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        File.countDocuments({ isTrashed: false }),
        Folder.countDocuments({ isTrashed: false }),
        File.aggregate([
            { $match: { isTrashed: false } },
            { $group: { _id: null, totalSize: { $sum: "$size" } } },
        ]),
    ]);

    const totalStorageBytes = storageResult[0]?.totalSize || 0;

    return sendSuccess(res, "System stats fetched", {
        users: { total: totalUsers, active: activeUsers },
        files: { total: totalFiles },
        folders: { total: totalFolders },
        storage: {
            totalBytes: totalStorageBytes,
            totalMB: (totalStorageBytes / (1024 * 1024)).toFixed(2),
            totalGB: (totalStorageBytes / (1024 * 1024 * 1024)).toFixed(4),
        },
    });
});

// ─── DELETE /api/admin/files/:id ──────────────────────────────────────────────
const adminDeleteFile = asyncHandler(async (req, res) => {
    const file = await File.findById(req.params.id);
    if (!file) {
        return sendError(res, "File not found", 404);
    }

    deleteLocalFile(file.path);
    await User.findByIdAndUpdate(file.userId, { $inc: { storageUsed: -file.size } });
    await file.deleteOne();

    return sendSuccess(res, "File permanently deleted by admin");
});

// ─── GET /api/admin/files ─────────────────────────────────────────────────────
const getAllFiles = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [files, total] = await Promise.all([
        File.find({ isTrashed: false })
            .populate("userId", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        File.countDocuments({ isTrashed: false }),
    ]);

    return res.status(200).json({
        success: true,
        message: "All files fetched",
        data: { files },
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    });
});

module.exports = {
    getAllUsers,
    getUserById,
    toggleUserStatus,
    changeUserRole,
    deleteUser,
    getSystemStats,
    adminDeleteFile,
    getAllFiles,
};
