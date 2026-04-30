const fs = require("fs");
const path = require("path");

/**
 * Delete a file from the local filesystem.
 * Silently ignores if file doesn't exist.
 */
const deleteLocalFile = (filePath) => {
    try {
        const absolutePath = path.isAbsolute(filePath)
            ? filePath
            : path.join(__dirname, "../", filePath);

        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
        }
    } catch (err) {
        console.error(`⚠️  Failed to delete file: ${filePath}`, err.message);
    }
};

/**
 * Format bytes into a human-readable size string.
 */
const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Get file extension from original filename.
 */
const getExtension = (filename) => {
    return path.extname(filename).toLowerCase().slice(1) || "unknown";
};

/**
 * Build the public URL for a stored file.
 */
const buildFileUrl = (req, filename) => {
    return `${req.protocol}://${req.get("host")}/uploads/${filename}`;
};

/**
 * Pagination helper — parse page & limit from query params.
 */
const getPagination = (query) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

/**
 * Build pagination meta object for response.
 */
const buildPaginationMeta = (total, page, limit) => ({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1,
});

module.exports = {
    deleteLocalFile,
    formatFileSize,
    getExtension,
    buildFileUrl,
    getPagination,
    buildPaginationMeta,
};
