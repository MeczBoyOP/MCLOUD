const express = require("express");
const router = express.Router();

const {
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
} = require("../controllers/folderController");

const { protect } = require("../middleware/auth");
const { validate, createFolderSchema, renameFolderSchema } = require("../middleware/validate");

// ─── Public route (no auth) ───────────────────────────────────────────────────
router.get("/shared/:token", getSharedFolder);

// All folder routes require authentication
router.use(protect);

router.post("/", validate(createFolderSchema), createFolder);
router.get("/", getFolders);
router.get("/starred", getStarredFolders);
router.get("/trash", getTrashFolders);
router.get("/:id", getFolderById);
router.get("/:id/breadcrumb", getBreadcrumb);
router.patch("/:id", validate(renameFolderSchema), renameFolder);
router.patch("/:id/star", toggleStar);
router.patch("/:id/hide", toggleHide);
router.patch("/:id/pin", togglePin);
router.post("/:id/share-token", generateShareToken);
router.post("/:id/copy", copyFolder);
router.patch("/:id/move", moveFolder);
router.delete("/:id", deleteFolder);
router.delete("/:id/permanent", permanentDeleteFolder);
router.post("/:id/restore", restoreFolder);

module.exports = router;
