import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    ArrowLeft, UserCheck, UserX, Crown, Trash2,
    HardDrive, FileText, FolderOpen, Calendar,
    Mail, Shield, Clock, Edit3, Save, X
} from "lucide-react";
import {
    getUserById, toggleUserStatus, changeUserRole,
    updateUserStorage, deleteUser
} from "../../features/admin/adminAPI";
import { toast } from "sonner";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const fmt = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const s = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${s[i]}`;
};

const pct = (used, limit) => Math.min(100, Math.round(((used || 0) / (limit || 1)) * 100));

const fileIcon = (mime) => {
    if (!mime) return "📄";
    if (mime.startsWith("image/")) return "🖼️";
    if (mime.startsWith("video/")) return "🎬";
    if (mime.startsWith("audio/")) return "🎵";
    if (mime.includes("pdf")) return "📕";
    if (mime.includes("zip") || mime.includes("rar")) return "🗜️";
    if (mime.includes("word") || mime.includes("document")) return "📝";
    if (mime.includes("sheet") || mime.includes("excel")) return "📊";
    return "📄";
};

/* ─── Stat Card ───────────────────────────────────────────────────────────── */
const StatCard = ({ icon, label, value, color }) => (
    <div className="flex items-center gap-3 p-4 rounded-xl"
        style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)"
        }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: `${color}22`, border: `1px solid ${color}33` }}>
            {React.cloneElement(icon, { size: 16, style: { color } })}
        </div>
        <div>
            <p className="text-lg font-bold text-white">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
        </div>
    </div>
);

/* ─── Storage Editor ──────────────────────────────────────────────────────── */
const StorageEditor = ({ userId, current, onDone }) => {
    const [gb, setGb] = useState((current / (1024 ** 3)).toFixed(0));
    const qc = useQueryClient();

    const mut = useMutation({
        mutationFn: () => updateUserStorage(userId, Number(gb) * 1024 ** 3),
        onSuccess: () => {
            toast.success("Storage limit updated");
            qc.invalidateQueries(["admin", "user", userId]);
            onDone();
        },
        onError: (e) => toast.error(e.response?.data?.message || "Failed"),
    });

    return (
        <div className="flex items-center gap-2 mt-2">
            <input
                type="number"
                value={gb}
                min={1}
                onChange={(e) => setGb(e.target.value)}
                className="w-24 px-2 py-1 rounded-lg text-sm text-white outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(37,99,235,0.4)" }}
            />
            <span className="text-xs text-gray-400">GB</span>
            <button onClick={() => mut.mutate()}
                disabled={mut.isPending}
                className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition">
                <Save size={14} />
            </button>
            <button onClick={onDone}
                className="p-1.5 rounded-lg text-gray-500 hover:text-white transition">
                <X size={14} />
            </button>
        </div>
    );
};

/* ─── Main ────────────────────────────────────────────────────────────────── */
const UserDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [editStorage, setEditStorage] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ["admin", "user", id],
        queryFn: () => getUserById(id),
    });

    const toggleMut = useMutation({
        mutationFn: () => toggleUserStatus(id),
        onSuccess: (res) => { toast.success(res.message); qc.invalidateQueries(["admin", "user", id]); },
        onError: (e) => toast.error(e.response?.data?.message || "Failed"),
    });

    const roleMut = useMutation({
        mutationFn: (role) => changeUserRole(id, role),
        onSuccess: (res) => { toast.success(res.message); qc.invalidateQueries(["admin", "user", id]); },
        onError: (e) => toast.error(e.response?.data?.message || "Failed"),
    });

    const deleteMut = useMutation({
        mutationFn: () => deleteUser(id),
        onSuccess: () => { toast.success("User deleted"); navigate("/admin/users"); },
        onError: (e) => toast.error(e.response?.data?.message || "Failed"),
    });

    if (isLoading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const { user, stats, recentFiles = [], storageByType = [] } = data?.data || {};
    if (!user) return <p className="text-gray-500">User not found.</p>;

    const p = pct(stats?.storageUsed, stats?.storageLimit);

    return (
        <div className="space-y-6">
            {/* Back */}
            <Link to="/admin/users"
                className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition">
                <ArrowLeft size={15} /> Back to Users
            </Link>

            {/* Profile Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-6"
                style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
                    border: "1px solid rgba(255,255,255,0.08)"
                }}
            >
                <div className="flex flex-wrap items-start gap-6">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shrink-0"
                        style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
                        {user.name?.charAt(0)?.toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                            <h1 className="text-xl font-bold text-white">{user.name}</h1>
                            <span className="text-[11px] px-2 py-0.5 rounded-md font-medium"
                                style={user.role === "admin"
                                    ? { background: "rgba(124,58,237,0.2)", color: "#a78bfa" }
                                    : { background: "rgba(37,99,235,0.15)", color: "#60a5fa" }}>
                                {user.role}
                            </span>
                            <span className="flex items-center gap-1 text-xs"
                                style={{ color: user.isActive ? "#34d399" : "#f87171" }}>
                                <span className="w-1.5 h-1.5 rounded-full"
                                    style={{ background: user.isActive ? "#34d399" : "#f87171" }} />
                                {user.isActive ? "Active" : "Inactive"}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1.5"><Mail size={12} />{user.email}</span>
                            <span className="flex items-center gap-1.5">
                                <Calendar size={12} />
                                Joined {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                            </span>
                            {user.lastLogin && (
                                <span className="flex items-center gap-1.5">
                                    <Clock size={12} />
                                    Last login {new Date(user.lastLogin).toLocaleDateString("en-IN")}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={() => toggleMut.mutate()}
                            disabled={toggleMut.isPending}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition"
                            style={user.isActive
                                ? { background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }
                                : { background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }
                            }>
                            {user.isActive ? <><UserX size={14} /> Deactivate</> : <><UserCheck size={14} /> Activate</>}
                        </button>

                        <button
                            onClick={() => roleMut.mutate(user.role === "admin" ? "user" : "admin")}
                            disabled={roleMut.isPending}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition"
                            style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)" }}>
                            {user.role === "admin" ? <><Shield size={14} /> Make User</> : <><Crown size={14} /> Make Admin</>}
                        </button>

                        <button
                            onClick={() => {
                                if (window.confirm(`Delete "${user.name}"? This is irreversible.`)) deleteMut.mutate();
                            }}
                            disabled={deleteMut.isPending}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition"
                            style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                            <Trash2 size={14} /> Delete
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={<FileText />} label="Files" value={stats?.fileCount ?? 0} color="#f59e0b" />
                <StatCard icon={<FolderOpen />} label="Folders" value={stats?.folderCount ?? 0} color="#8b5cf6" />
                <StatCard icon={<Trash2 />} label="Trashed" value={stats?.trashedFileCount ?? 0} color="#ef4444" />
                <StatCard icon={<HardDrive />} label="Used" value={fmt(stats?.storageUsed)} color="#2563eb" />
            </div>

            {/* Storage */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl p-5"
                style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
                    border: "1px solid rgba(255,255,255,0.07)"
                }}
            >
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                        <HardDrive size={15} className="text-blue-400" /> Storage Quota
                    </h2>
                    <button onClick={() => setEditStorage(!editStorage)}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-400 transition">
                        <Edit3 size={12} /> Edit Limit
                    </button>
                </div>

                <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-xl font-bold text-white">{fmt(stats?.storageUsed)}</span>
                    <span className="text-sm text-gray-500">/ {fmt(stats?.storageLimit)}</span>
                    <span className="ml-auto text-sm" style={{ color: p > 80 ? "#ef4444" : "#60a5fa" }}>{p}%</span>
                </div>

                <div className="w-full h-2 rounded-full mb-3" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full transition-all"
                        style={{
                            width: `${p}%`,
                            background: p > 80 ? "#ef4444" : "linear-gradient(90deg, #2563eb, #7c3aed)"
                        }} />
                </div>

                {editStorage && (
                    <StorageEditor
                        userId={id}
                        current={stats?.storageLimit}
                        onDone={() => setEditStorage(false)}
                    />
                )}

                {/* File type breakdown */}
                {storageByType.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {storageByType.slice(0, 6).map((t) => {
                            const typePct = pct(t.size, stats?.storageUsed);
                            const label = t._id?.split("/")[1] || t._id || "other";
                            return (
                                <div key={t._id} className="flex items-center gap-3">
                                    <span className="text-xs text-gray-500 w-16 truncate">{label}</span>
                                    <div className="flex-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                                        <div className="h-full rounded-full"
                                            style={{ width: `${typePct}%`, background: "linear-gradient(90deg, #2563eb80, #7c3aed80)" }} />
                                    </div>
                                    <span className="text-[10px] text-gray-600 w-12 text-right">{fmt(t.size)}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </motion.div>

            {/* Recent Files */}
            {recentFiles.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl p-5"
                    style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
                        border: "1px solid rgba(255,255,255,0.07)"
                    }}
                >
                    <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                        <FileText size={15} className="text-amber-400" /> Recent Uploads
                    </h2>
                    <div className="space-y-2">
                        {recentFiles.map((f) => (
                            <div key={f._id} className="flex items-center gap-3 py-2 border-b last:border-0"
                                style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                                <span className="text-lg shrink-0">{fileIcon(f.mimetype)}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white truncate">{f.originalName}</p>
                                    <p className="text-xs text-gray-500">{fmt(f.size)} · {new Date(f.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default UserDetail;
