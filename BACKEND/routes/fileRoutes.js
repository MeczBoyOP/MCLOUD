const express = require("express");
const router = express.Router();

const {
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
} = require("../controllers/fileController");

const { protect } = require("../middleware/auth");
const upload = require("../config/multer");

// ─── Public route (no auth) ───────────────────────────────────────────────────
router.get("/shared/:token", getSharedFile);

// All remaining file routes require authentication
router.use(protect);

// Special named routes BEFORE /:id to avoid route conflicts
router.get("/starred", getStarredFiles);
router.get("/trash", getTrashFiles);
router.get("/search", searchFiles);

// Main CRUD
router.post("/upload", upload.single("file"), uploadFile);
router.get("/", getFiles);
router.get("/:id", getFileById);
router.get("/:id/download", downloadFile);
router.patch("/:id/star", toggleStar);
router.patch("/:id/hide", toggleHide);
router.patch("/:id/pin", togglePin);
router.patch("/:id/rename", renameFile);
router.post("/:id/copy", copyFile);
router.post("/:id/share-token", generateShareToken);
router.patch("/:id/move", moveFile);
router.delete("/:id", deleteFile);
router.delete("/:id/permanent", permanentDeleteFile);
router.post("/:id/restore", restoreFile);

module.exports = router;
