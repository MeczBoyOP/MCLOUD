const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/User");
const File = require("../models/File");
const Folder = require("../models/Folder");
const { sendSuccess, sendError } = require("../utils/response");
const { deleteLocalFile } = require("../utils/fileUtils");

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
const getSystemStats = asyncHandler(async (req, res) => {
    const [
        totalUsers,
        activeUsers,
        inactiveUsers,
        adminUsers,
        totalFiles,
        totalFolders,
        storageResult,
        recentUsers,
    ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ isActive: false }),
        User.countDocuments({ role: "admin" }),
        File.countDocuments({ isTrashed: false }),
        Folder.countDocuments({ isTrashed: false }),
        File.aggregate([
            { $match: { isTrashed: false } },
            { $group: { _id: null, totalSize: { $sum: "$size" } } },
        ]),
        User.find().sort({ createdAt: -1 }).limit(5).select("-password"),
    ]);

    const totalStorageBytes = storageResult[0]?.totalSize || 0;

    // Storage breakdown by user (top 5 consumers)
    const topStorageUsers = await User.find()
        .sort({ storageUsed: -1 })
        .limit(5)
        .select("name email storageUsed storageLimit avatar");

    // New users per day for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailySignups = await User.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    // File uploads per day for last 7 days
    const dailyUploads = await File.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo }, isTrashed: false } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 },
                size: { $sum: "$size" },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    // File type breakdown
    const fileTypeBreakdown = await File.aggregate([
        { $match: { isTrashed: false } },
        {
            $group: {
                _id: "$mimetype",
                count: { $sum: 1 },
                size: { $sum: "$size" },
            },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
    ]);

    return sendSuccess(res, "System stats fetched", {
        users: {
            total: totalUsers,
            active: activeUsers,
            inactive: inactiveUsers,
            admins: adminUsers,
        },
        files: { total: totalFiles },
        folders: { total: totalFolders },
        storage: {
            totalBytes: totalStorageBytes,
            totalMB: (totalStorageBytes / (1024 * 1024)).toFixed(2),
            totalGB: (totalStorageBytes / (1024 * 1024 * 1024)).toFixed(4),
        },
        recentUsers,
        topStorageUsers,
        charts: {
            dailySignups,
            dailyUploads,
            fileTypeBreakdown,
        },
    });
});

// ─── GET /api/admin/users ──────────────────────────────────────────────────────
const getAllUsers = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const status = req.query.status; // "active" | "inactive" | ""
    const role = req.query.role;     // "user" | "admin" | ""
    const sort = req.query.sort || "-createdAt";

    const query = {};
    if (search.trim()) {
        query.$or = [
            { name: { $regex: search.trim(), $options: "i" } },
            { email: { $regex: search.trim(), $options: "i" } },
        ];
    }
    if (status === "active") query.isActive = true;
    if (status === "inactive") query.isActive = false;
    if (role === "admin") query.role = "admin";
    if (role === "user") query.role = "user";

    const [users, total] = await Promise.all([
        User.find(query).select("-password").sort(sort).skip(skip).limit(limit),
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
    if (!user) return sendError(res, "User not found", 404);

    const [fileCount, folderCount, trashedFileCount, recentFiles] = await Promise.all([
        File.countDocuments({ userId: user._id, isTrashed: false }),
        Folder.countDocuments({ userId: user._id, isTrashed: false }),
        File.countDocuments({ userId: user._id, isTrashed: true }),
        File.find({ userId: user._id, isTrashed: false })
            .sort({ createdAt: -1 })
            .limit(5)
            .select("originalName size mimetype createdAt"),
    ]);

    // Storage by file type for this user
    const storageByType = await File.aggregate([
        { $match: { userId: user._id, isTrashed: false } },
        {
            $group: {
                _id: "$mimetype",
                count: { $sum: 1 },
                size: { $sum: "$size" },
            },
        },
        { $sort: { size: -1 } },
    ]);

    return sendSuccess(res, "User fetched", {
        user,
        stats: {
            fileCount,
            folderCount,
            trashedFileCount,
            storageUsed: user.storageUsed,
            storageLimit: user.storageLimit,
        },
        recentFiles,
        storageByType,
    });
});

// ─── PATCH /api/admin/users/:id/status ────────────────────────────────────────
const toggleUserStatus = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, "User not found", 404);

    if (user._id.toString() === req.user._id.toString()) {
        return sendError(res, "You cannot deactivate your own account", 400);
    }

    user.isActive = !user.isActive;
    await user.save();

    return sendSuccess(
        res,
        user.isActive ? "User activated successfully" : "User deactivated successfully",
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
    if (!user) return sendError(res, "User not found", 404);

    if (user._id.toString() === req.user._id.toString()) {
        return sendError(res, "You cannot change your own role", 400);
    }

    user.role = role;
    await user.save();

    return sendSuccess(res, `User role updated to '${role}'`, {
        user: user.toSafeObject(),
    });
});

// ─── PATCH /api/admin/users/:id/storage ──────────────────────────────────────
const updateUserStorage = asyncHandler(async (req, res) => {
    const { storageLimit } = req.body; // in bytes

    if (!storageLimit || typeof storageLimit !== "number" || storageLimit <= 0) {
        return sendError(res, "storageLimit must be a positive number in bytes", 400);
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { storageLimit },
        { new: true, runValidators: true }
    ).select("-password");

    if (!user) return sendError(res, "User not found", 404);

    return sendSuccess(res, "Storage limit updated", { user });
});

// ─── DELETE /api/admin/users/:id ──────────────────────────────────────────────
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, "User not found", 404);

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

// ─── GET /api/admin/files ─────────────────────────────────────────────────────
const getAllFiles = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const mimetype = req.query.mimetype || "";
    const sort = req.query.sort || "-createdAt";

    const query = { isTrashed: false };
    if (search.trim()) {
        query.originalName = { $regex: search.trim(), $options: "i" };
    }
    if (mimetype) {
        query.mimetype = { $regex: mimetype, $options: "i" };
    }

    const [files, total] = await Promise.all([
        File.find(query)
            .populate("userId", "name email avatar")
            .sort(sort)
            .skip(skip)
            .limit(limit),
        File.countDocuments(query),
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

// ─── DELETE /api/admin/files/:id ──────────────────────────────────────────────
const adminDeleteFile = asyncHandler(async (req, res) => {
    const file = await File.findById(req.params.id);
    if (!file) return sendError(res, "File not found", 404);

    deleteLocalFile(file.path);
    await User.findByIdAndUpdate(file.userId, { $inc: { storageUsed: -file.size } });
    await file.deleteOne();

    return sendSuccess(res, "File permanently deleted by admin");
});

// ─── GET /api/admin/activity ──────────────────────────────────────────────────
// Returns recent platform-wide activity (recent uploads + new users)
const getRecentActivity = asyncHandler(async (req, res) => {
    const limit = Math.min(50, parseInt(req.query.limit) || 20);

    const [recentFiles, recentUsers] = await Promise.all([
        File.find({ isTrashed: false })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate("userId", "name email avatar")
            .select("originalName size mimetype createdAt userId"),
        User.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .select("name email createdAt role isActive avatar"),
    ]);

    // Merge and label activity
    const activity = [
        ...recentFiles.map((f) => ({
            type: "upload",
            message: `${f.userId?.name || "Unknown"} uploaded "${f.originalName}"`,
            user: f.userId,
            file: { id: f._id, name: f.originalName, size: f.size, mimetype: f.mimetype },
            createdAt: f.createdAt,
        })),
        ...recentUsers.map((u) => ({
            type: "signup",
            message: `${u.name} joined MCloud`,
            user: { _id: u._id, name: u.name, email: u.email, avatar: u.avatar },
            createdAt: u.createdAt,
        })),
    ]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);

    return sendSuccess(res, "Recent activity fetched", { activity });
});

module.exports = {
    getAllUsers,
    getUserById,
    toggleUserStatus,
    changeUserRole,
    updateUserStorage,
    deleteUser,
    getSystemStats,
    adminDeleteFile,
    getAllFiles,
    getRecentActivity,
};
