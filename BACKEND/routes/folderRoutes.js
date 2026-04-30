const express = require("express");
const router = express.Router();

const {
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
} = require("../controllers/folderController");

const { protect } = require("../middleware/auth");
const { validate, createFolderSchema, renameFolderSchema } = require("../middleware/validate");

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
router.patch("/:id/move", moveFolder);
router.delete("/:id", deleteFolder);
router.delete("/:id/permanent", permanentDeleteFolder);
router.post("/:id/restore", restoreFolder);

module.exports = router;
