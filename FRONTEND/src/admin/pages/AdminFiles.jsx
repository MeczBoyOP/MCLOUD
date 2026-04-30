import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
    Search, Trash2, RefreshCw, ChevronLeft, ChevronRight,
    FileText, Image, Film, Music, Archive, ArrowUpRight
} from "lucide-react";
import { getAllFiles, adminDeleteFile } from "../../features/admin/adminAPI";
import { toast } from "sonner";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const fmt = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const s = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${s[i]}`;
};

const FileIcon = ({ mime }) => {
    if (!mime) return <FileText size={16} className="text-gray-400" />;
    if (mime.startsWith("image/")) return <Image size={16} className="text-pink-400" />;
    if (mime.startsWith("video/")) return <Film size={16} className="text-purple-400" />;
    if (mime.startsWith("audio/")) return <Music size={16} className="text-green-400" />;
    if (mime.includes("zip") || mime.includes("rar")) return <Archive size={16} className="text-amber-400" />;
    return <FileText size={16} className="text-blue-400" />;
};

const mimeBadge = (mime) => {
    if (!mime) return { label: "other", color: "#6b7280", bg: "rgba(107,114,128,0.15)" };
    if (mime.startsWith("image/")) return { label: "image", color: "#f472b6", bg: "rgba(244,114,182,0.15)" };
    if (mime.startsWith("video/")) return { label: "video", color: "#a78bfa", bg: "rgba(167,139,250,0.15)" };
    if (mime.startsWith("audio/")) return { label: "audio", color: "#34d399", bg: "rgba(52,211,153,0.15)" };
    if (mime.includes("pdf")) return { label: "pdf", color: "#f87171", bg: "rgba(248,113,113,0.15)" };
    if (mime.includes("zip") || mime.includes("rar")) return { label: "archive", color: "#fbbf24", bg: "rgba(251,191,36,0.15)" };
    if (mime.includes("word") || mime.includes("document")) return { label: "doc", color: "#60a5fa", bg: "rgba(96,165,250,0.15)" };
    return { label: mime.split("/")[1] || "file", color: "#9ca3af", bg: "rgba(156,163,175,0.1)" };
};

/* ─── Confirm Delete Modal ───────────────────────────────────────────────── */
const ConfirmModal = ({ open, fileName, onConfirm, onClose }) => (
    <AnimatePresence>
        {open && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="absolute inset-0 bg-black/70" onClick={onClose} />
                <motion.div className="relative w-full max-w-sm rounded-2xl p-6"
                    initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                    style={{ background: "linear-gradient(135deg, #0f1629, #0a0f1e)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <h3 className="text-base font-semibold text-white mb-2">Delete File</h3>
                    <p className="text-sm text-gray-400 mb-1">Permanently delete:</p>
                    <p className="text-sm text-red-400 font-medium mb-4 truncate">"{fileName}"</p>
                    <p className="text-xs text-gray-500 mb-5">This action cannot be undone. The file will be removed from disk.</p>
                    <div className="flex gap-3">
                        <button onClick={onClose}
                            className="flex-1 py-2 rounded-lg text-sm text-gray-400"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                            Cancel
                        </button>
                        <button onClick={onConfirm}
                            className="flex-1 py-2 rounded-lg text-sm font-medium text-white"
                            style={{ background: "linear-gradient(135deg, #dc2626, #991b1b)" }}>
                            Delete
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

/* ─── File Row ────────────────────────────────────────────────────────────── */
const FileRow = ({ file, onDelete, index }) => {
    const badge = mimeBadge(file.mimetype);
    return (
        <motion.tr
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.025 }}
            className="group border-b"
            style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: badge.bg }}>
                        <FileIcon mime={file.mimetype} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm text-white truncate max-w-[220px]" title={file.originalName}>
                            {file.originalName}
                        </p>
                        <p className="text-xs text-gray-500">{fmt(file.size)}</p>
                    </div>
                </div>
            </td>

            <td className="px-4 py-3">
                <span className="text-[11px] px-2 py-0.5 rounded-md font-medium"
                    style={{ background: badge.bg, color: badge.color }}>
                    {badge.label}
                </span>
            </td>

            <td className="px-4 py-3">
                {file.userId ? (
                    <Link to={`/admin/users/${file.userId._id}`}
                        className="flex items-center gap-2 hover:opacity-80 transition">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                            style={{ background: "linear-gradient(135deg, #2563eb80, #7c3aed80)" }}>
                            {file.userId.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="text-xs text-gray-300 truncate max-w-[120px]">{file.userId.name}</span>
                        <ArrowUpRight size={10} className="text-gray-600 shrink-0" />
                    </Link>
                ) : (
                    <span className="text-xs text-gray-600">—</span>
                )}
            </td>

            <td className="px-4 py-3 text-xs text-gray-500">
                {new Date(file.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </td>

            <td className="px-4 py-3 text-xs text-gray-500">
                {file.downloadCount || 0}
            </td>

            <td className="px-4 py-3">
                <button
                    onClick={() => onDelete(file)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition opacity-0 group-hover:opacity-100"
                    title="Delete file">
                    <Trash2 size={14} />
                </button>
            </td>
        </motion.tr>
    );
};

/* ─── Main Page ───────────────────────────────────────────────────────────── */
const AdminFiles = () => {
    const qc = useQueryClient();
    const [search, setSearch] = useState("");
    const [mimetype, setMimetype] = useState("");
    const [page, setPage] = useState(1);
    const [confirm, setConfirm] = useState(null);

    const params = { page, limit: 20, search, mimetype };

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ["admin", "files", params],
        queryFn: () => getAllFiles(params),
        keepPreviousData: true,
    });

    const files = data?.data?.files || [];
    const pagination = data?.pagination || {};

    const deleteMut = useMutation({
        mutationFn: (id) => adminDeleteFile(id),
        onSuccess: () => {
            toast.success("File deleted");
            qc.invalidateQueries(["admin", "files"]);
            qc.invalidateQueries(["admin", "stats"]);
        },
        onError: (e) => toast.error(e.response?.data?.message || "Failed"),
    });

    const mimeFilters = [
        { label: "All", value: "" },
        { label: "Images", value: "image/" },
        { label: "Videos", value: "video/" },
        { label: "Audio", value: "audio/" },
        { label: "PDFs", value: "pdf" },
        { label: "Docs", value: "word" },
        { label: "Archives", value: "zip" },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">File Management</h1>
                    <p className="text-sm text-gray-500 mt-1">{pagination.total || 0} files on platform</p>
                </div>
                <button onClick={() => qc.invalidateQueries(["admin", "files"])}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-52">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search file name..."
                        className="w-full pl-9 pr-4 py-2 rounded-lg text-sm text-white placeholder-gray-600 outline-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                        onFocus={e => e.target.style.borderColor = "rgba(37,99,235,0.5)"}
                        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                    />
                </div>

                {/* Type pills */}
                <div className="flex items-center gap-2 flex-wrap">
                    {mimeFilters.map(({ label, value }) => (
                        <button
                            key={label}
                            onClick={() => { setMimetype(value); setPage(1); }}
                            className="text-xs px-3 py-1.5 rounded-lg transition"
                            style={mimetype === value
                                ? { background: "rgba(37,99,235,0.25)", color: "#60a5fa", border: "1px solid rgba(37,99,235,0.3)" }
                                : { background: "rgba(255,255,255,0.04)", color: "#6b7280", border: "1px solid rgba(255,255,255,0.06)" }
                            }>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl overflow-hidden"
                style={{ border: "1px solid rgba(255,255,255,0.07)", background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))" }}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                                {["File", "Type", "Owner", "Uploaded", "Downloads", ""].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-medium">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} className="text-center py-12 text-gray-500 text-sm">Loading...</td></tr>
                            ) : files.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-12 text-gray-500 text-sm">No files found</td></tr>
                            ) : (
                                files.map((f, i) => (
                                    <FileRow key={f._id} file={f} index={i}
                                        onDelete={(f) => setConfirm(f)} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3"
                        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                        <p className="text-xs text-gray-500">
                            Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
                        </p>
                        <div className="flex gap-2">
                            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-white disabled:opacity-30"
                                style={{ background: "rgba(255,255,255,0.05)" }}>
                                <ChevronLeft size={14} />
                            </button>
                            <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-white disabled:opacity-30"
                                style={{ background: "rgba(255,255,255,0.05)" }}>
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirm Delete */}
            <ConfirmModal
                open={!!confirm}
                fileName={confirm?.originalName}
                onConfirm={() => { deleteMut.mutate(confirm._id); setConfirm(null); }}
                onClose={() => setConfirm(null)}
            />
        </div>
    );
};

export default AdminFiles;
