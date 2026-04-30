import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
    Search, Filter, UserCheck, UserX, Trash2,
    Crown, User, RefreshCw, ChevronLeft, ChevronRight,
    ArrowUpRight, Shield, HardDrive, Eye
} from "lucide-react";
import {
    getAllUsers, toggleUserStatus, changeUserRole, deleteUser
} from "../../features/admin/adminAPI";
import { toast } from "sonner";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const fmt = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const s = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${s[i]}`;
};

const pct = (used, limit) => Math.min(100, Math.round(((used || 0) / (limit || 1)) * 100));

/* ─── Confirm Modal ───────────────────────────────────────────────────────── */
const ConfirmModal = ({ open, title, body, onConfirm, onClose, danger }) => (
    <AnimatePresence>
        {open && (
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <div className="absolute inset-0 bg-black/70" onClick={onClose} />
                <motion.div
                    className="relative w-full max-w-sm rounded-2xl p-6"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    style={{
                        background: "linear-gradient(135deg, #0f1629, #0a0f1e)",
                        border: "1px solid rgba(255,255,255,0.1)"
                    }}
                >
                    <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
                    <p className="text-sm text-gray-400 mb-5">{body}</p>
                    <div className="flex gap-3">
                        <button onClick={onClose}
                            className="flex-1 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                            Cancel
                        </button>
                        <button onClick={onConfirm}
                            className="flex-1 py-2 rounded-lg text-sm font-medium text-white transition"
                            style={{
                                background: danger
                                    ? "linear-gradient(135deg, #dc2626, #991b1b)"
                                    : "linear-gradient(135deg, #2563eb, #1e40af)",
                                border: "none"
                            }}>
                            Confirm
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

/* ─── User Row ────────────────────────────────────────────────────────────── */
const UserRow = ({ user, onToggle, onRole, onDelete, index }) => {
    const p = pct(user.storageUsed, user.storageLimit);

    return (
        <motion.tr
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="group border-b"
            style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
            {/* User */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
                        {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                </div>
            </td>

            {/* Role */}
            <td className="px-4 py-3">
                <span className="text-[11px] px-2 py-0.5 rounded-md font-medium"
                    style={user.role === "admin"
                        ? { background: "rgba(124,58,237,0.2)", color: "#a78bfa" }
                        : { background: "rgba(37,99,235,0.15)", color: "#60a5fa" }
                    }>
                    {user.role === "admin" ? "Admin" : "User"}
                </span>
            </td>

            {/* Status */}
            <td className="px-4 py-3">
                <span className="flex items-center gap-1.5 text-xs"
                    style={{ color: user.isActive ? "#34d399" : "#f87171" }}>
                    <span className="w-1.5 h-1.5 rounded-full"
                        style={{ background: user.isActive ? "#34d399" : "#f87171" }} />
                    {user.isActive ? "Active" : "Inactive"}
                </span>
            </td>

            {/* Storage */}
            <td className="px-4 py-3 min-w-[120px]">
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-full rounded-full" style={{
                            width: `${p}%`,
                            background: p > 80 ? "#ef4444" : "linear-gradient(90deg, #2563eb, #7c3aed)"
                        }} />
                    </div>
                    <span className="text-[10px] text-gray-500 shrink-0">{fmt(user.storageUsed)}</span>
                </div>
            </td>

            {/* Joined */}
            <td className="px-4 py-3 text-xs text-gray-500">
                {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </td>

            {/* Actions */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <Link to={`/admin/users/${user._id}`}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition"
                        title="View details">
                        <Eye size={14} />
                    </Link>
                    <button onClick={() => onToggle(user)}
                        className="p-1.5 rounded-lg transition"
                        style={{
                            color: user.isActive ? "#f87171" : "#34d399",
                            background: "transparent"
                        }}
                        title={user.isActive ? "Deactivate" : "Activate"}>
                        {user.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                    </button>
                    <button onClick={() => onRole(user)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition"
                        title="Change role">
                        {user.role === "admin" ? <User size={14} /> : <Crown size={14} />}
                    </button>
                    <button onClick={() => onDelete(user)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
                        title="Delete user">
                        <Trash2 size={14} />
                    </button>
                </div>
            </td>
        </motion.tr>
    );
};

/* ─── Main Page ───────────────────────────────────────────────────────────── */
const UserManagement = () => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [role, setRole] = useState("");
    const [page, setPage] = useState(1);
    const [confirm, setConfirm] = useState(null); // { action, user }

    const params = { page, limit: 15, search, status, role };

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ["admin", "users", params],
        queryFn: () => getAllUsers(params),
        keepPreviousData: true,
    });

    const users = data?.data?.users || [];
    const pagination = data?.pagination || {};

    const toggleMut = useMutation({
        mutationFn: (id) => toggleUserStatus(id),
        onSuccess: (res) => {
            toast.success(res.message);
            queryClient.invalidateQueries(["admin", "users"]);
            queryClient.invalidateQueries(["admin", "stats"]);
        },
        onError: (e) => toast.error(e.response?.data?.message || "Failed"),
    });

    const roleMut = useMutation({
        mutationFn: ({ id, role }) => changeUserRole(id, role),
        onSuccess: (res) => {
            toast.success(res.message);
            queryClient.invalidateQueries(["admin", "users"]);
        },
        onError: (e) => toast.error(e.response?.data?.message || "Failed"),
    });

    const deleteMut = useMutation({
        mutationFn: (id) => deleteUser(id),
        onSuccess: () => {
            toast.success("User deleted");
            queryClient.invalidateQueries(["admin", "users"]);
            queryClient.invalidateQueries(["admin", "stats"]);
        },
        onError: (e) => toast.error(e.response?.data?.message || "Failed"),
    });

    const handleConfirm = () => {
        if (!confirm) return;
        const { action, user } = confirm;
        if (action === "toggle") toggleMut.mutate(user._id);
        if (action === "role") roleMut.mutate({ id: user._id, role: user.role === "admin" ? "user" : "admin" });
        if (action === "delete") deleteMut.mutate(user._id);
        setConfirm(null);
    };

    const Pill = ({ label, value, current, onClick }) => (
        <button
            onClick={() => { onClick(current === value ? "" : value); setPage(1); }}
            className="text-xs px-3 py-1.5 rounded-lg transition"
            style={current === value
                ? { background: "rgba(37,99,235,0.25)", color: "#60a5fa", border: "1px solid rgba(37,99,235,0.3)" }
                : { background: "rgba(255,255,255,0.04)", color: "#6b7280", border: "1px solid rgba(255,255,255,0.06)" }
            }>
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">User Management</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {pagination.total || 0} registered users
                    </p>
                </div>
                <button
                    onClick={() => queryClient.invalidateQueries(["admin", "users"])}
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
                        placeholder="Search name or email..."
                        className="w-full pl-9 pr-4 py-2 rounded-lg text-sm text-white placeholder-gray-600 outline-none transition"
                        style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                        }}
                        onFocus={e => e.target.style.borderColor = "rgba(37,99,235,0.5)"}
                        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                    />
                </div>

                {/* Status pills */}
                <div className="flex items-center gap-2">
                    <Filter size={13} className="text-gray-600" />
                    <Pill label="Active" value="active" current={status} onClick={setStatus} />
                    <Pill label="Inactive" value="inactive" current={status} onClick={setStatus} />
                </div>

                {/* Role pills */}
                <div className="flex items-center gap-2">
                    <Pill label="Admins" value="admin" current={role} onClick={setRole} />
                    <Pill label="Users" value="user" current={role} onClick={setRole} />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl overflow-hidden"
                style={{
                    border: "1px solid rgba(255,255,255,0.07)",
                    background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))"
                }}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                                {["User", "Role", "Status", "Storage", "Joined", "Actions"].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-medium">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} className="text-center py-12 text-gray-500 text-sm">Loading...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-12 text-gray-500 text-sm">No users found</td></tr>
                            ) : (
                                users.map((u, i) => (
                                    <UserRow
                                        key={u._id}
                                        user={u}
                                        index={i}
                                        onToggle={(u) => setConfirm({ action: "toggle", user: u })}
                                        onRole={(u) => setConfirm({ action: "role", user: u })}
                                        onDelete={(u) => setConfirm({ action: "delete", user: u })}
                                    />
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
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage(p => p - 1)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 transition"
                                style={{ background: "rgba(255,255,255,0.05)" }}>
                                <ChevronLeft size={14} />
                            </button>
                            <button
                                disabled={page >= pagination.totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 transition"
                                style={{ background: "rgba(255,255,255,0.05)" }}>
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirm Modal */}
            <ConfirmModal
                open={!!confirm}
                title={
                    confirm?.action === "delete" ? "Delete User"
                    : confirm?.action === "toggle"
                        ? (confirm?.user?.isActive ? "Deactivate User" : "Activate User")
                        : "Change Role"
                }
                body={
                    confirm?.action === "delete"
                        ? `Permanently delete "${confirm?.user?.name}" and all their files? This cannot be undone.`
                        : confirm?.action === "toggle"
                            ? `${confirm?.user?.isActive ? "Deactivate" : "Activate"} account for "${confirm?.user?.name}"?`
                            : `Change role from "${confirm?.user?.role}" to "${confirm?.user?.role === "admin" ? "user" : "admin"}" for "${confirm?.user?.name}"?`
                }
                danger={confirm?.action === "delete"}
                onConfirm={handleConfirm}
                onClose={() => setConfirm(null)}
            />
        </div>
    );
};

export default UserManagement;