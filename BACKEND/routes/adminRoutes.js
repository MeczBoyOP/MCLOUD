const express = require("express");
const router = express.Router();

const {
    getAllUsers,
    getUserById,
    toggleUserStatus,
    changeUserRole,
    deleteUser,
    getSystemStats,
    adminDeleteFile,
    getAllFiles,
} = require("../controllers/adminController");

const { protect, authorize } = require("../middleware/auth");

// All admin routes require auth + admin role
router.use(protect, authorize("admin"));

router.get("/stats", getSystemStats);
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/status", toggleUserStatus);
router.patch("/users/:id/role", changeUserRole);
router.delete("/users/:id", deleteUser);
router.get("/files", getAllFiles);
router.delete("/files/:id", adminDeleteFile);

module.exports = router;
