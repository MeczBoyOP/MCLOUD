const express = require("express");
const router = express.Router();

const {
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
} = require("../controllers/adminController");

const { protect, authorize } = require("../middleware/auth");

// All admin routes require auth + admin role
router.use(protect, authorize("admin"));

// Dashboard
router.get("/stats", getSystemStats);
router.get("/activity", getRecentActivity);

// User management
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/status", toggleUserStatus);
router.patch("/users/:id/role", changeUserRole);
router.patch("/users/:id/storage", updateUserStorage);
router.delete("/users/:id", deleteUser);

// File management
router.get("/files", getAllFiles);
router.delete("/files/:id", adminDeleteFile);

module.exports = router;
