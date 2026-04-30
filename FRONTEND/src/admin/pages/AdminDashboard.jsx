import React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
    Users, FileText, HardDrive, FolderOpen,
    UserCheck, UserX, TrendingUp, Activity,
    ArrowUpRight, Crown, Upload
} from "lucide-react";
import { getSystemStats } from "../../features/admin/adminAPI";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const fmt = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const s = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${s[i]}`;
};

const pct = (used, limit) => {
    if (!limit) return 0;
    return Math.min(100, Math.round((used / limit) * 100));
};

/* ─── Stat Card ───────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, icon: Icon, color, sub, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
            border: "1px solid rgba(255,255,255,0.07)",
        }}
    >
        {/* Glow */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20"
            style={{ background: color }} />

        <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
                <Icon size={18} style={{ color }} />
            </div>
            <ArrowUpRight size={14} className="text-gray-600" />
        </div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{label}</p>
        {sub && <p className="text-[11px] text-gray-600 mt-0.5">{sub}</p>}
    </motion.div>
);

/* ─── User Row ────────────────────────────────────────────────────────────── */
const UserRow = ({ user, index }) => (
    <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="flex items-center gap-3 py-2.5 border-b last:border-0"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
    >
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
            {user.name?.charAt(0)?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
            {user.role === "admin" && (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                    style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa" }}>
                    Admin
                </span>
            )}
            <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-emerald-400" : "bg-red-400"}`} />
        </div>
    </motion.div>
);

/* ─── Top Storage User ────────────────────────────────────────────────────── */
const StorageUserRow = ({ user, index }) => {
    const p = pct(user.storageUsed, user.storageLimit);
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.06 }}
            className="flex items-center gap-3 py-2"
        >
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: "linear-gradient(135deg, #2563eb80, #7c3aed80)" }}>
                {user.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                    <p className="text-xs text-gray-300 truncate">{user.name}</p>
                    <p className="text-[10px] text-gray-500 shrink-0 ml-2">{fmt(user.storageUsed)}</p>
                </div>
                <div className="w-full h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full transition-all"
                        style={{
                            width: `${p}%`,
                            background: p > 80 ? "#ef4444" : "linear-gradient(90deg, #2563eb, #7c3aed)"
                        }} />
                </div>
            </div>
            <span className="text-[10px] text-gray-500 shrink-0 w-8 text-right">{p}%</span>
        </motion.div>
    );
};

/* ─── Main Page ───────────────────────────────────────────────────────────── */
const AdminDashboard = () => {
    const { data, isLoading } = useQuery({
        queryKey: ["admin", "stats"],
        queryFn: getSystemStats,
        refetchInterval: 30_000,
    });

    const stats = data?.data;

    const cards = [
        {
            label: "Total Users",
            value: stats?.users?.total ?? "—",
            icon: Users,
            color: "#2563eb",
            sub: `${stats?.users?.active ?? 0} active · ${stats?.users?.inactive ?? 0} inactive`,
        },
        {
            label: "Active Users",
            value: stats?.users?.active ?? "—",
            icon: UserCheck,
            color: "#10b981",
            sub: `${stats?.users?.admins ?? 0} admin(s)`,
        },
        {
            label: "Total Files",
            value: stats?.files?.total ?? "—",
            icon: FileText,
            color: "#f59e0b",
            sub: "Not in trash",
        },
        {
            label: "Total Folders",
            value: stats?.folders?.total ?? "—",
            icon: FolderOpen,
            color: "#8b5cf6",
        },
        {
            label: "Storage Used",
            value: stats?.storage ? fmt(stats.storage.totalBytes) : "—",
            icon: HardDrive,
            color: "#06b6d4",
            sub: `${Number(stats?.storage?.totalGB ?? 0).toFixed(2)} GB total`,
        },
        {
            label: "Inactive Users",
            value: stats?.users?.inactive ?? "—",
            icon: UserX,
            color: "#ef4444",
            sub: "Deactivated accounts",
        },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Platform overview & system health</p>
            </motion.div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {cards.map((c, i) => <StatCard key={c.label} {...c} delay={i * 0.05} />)}
            </div>

            {/* Bottom Panels */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Recent Users */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-2xl p-5"
                    style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
                        border: "1px solid rgba(255,255,255,0.07)"
                    }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                            <TrendingUp size={15} className="text-blue-400" />
                            Recent Users
                        </h2>
                        <Link to="/admin/users"
                            className="text-xs text-blue-400 hover:text-blue-300 transition flex items-center gap-1">
                            View all <ArrowUpRight size={12} />
                        </Link>
                    </div>
                    <div>
                        {(stats?.recentUsers || []).map((u, i) => <UserRow key={u._id} user={u} index={i} />)}
                        {!stats?.recentUsers?.length && (
                            <p className="text-xs text-gray-500 text-center py-4">No users yet</p>
                        )}
                    </div>
                </motion.div>

                {/* Top Storage Users */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="rounded-2xl p-5"
                    style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
                        border: "1px solid rgba(255,255,255,0.07)"
                    }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                            <Crown size={15} className="text-amber-400" />
                            Top Storage Users
                        </h2>
                        <Link to="/admin/users?sort=-storageUsed"
                            className="text-xs text-blue-400 hover:text-blue-300 transition flex items-center gap-1">
                            View all <ArrowUpRight size={12} />
                        </Link>
                    </div>
                    <div className="space-y-1">
                        {(stats?.topStorageUsers || []).map((u, i) => (
                            <StorageUserRow key={u._id} user={u} index={i} />
                        ))}
                        {!stats?.topStorageUsers?.length && (
                            <p className="text-xs text-gray-500 text-center py-4">No data yet</p>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* File Type Breakdown */}
            {stats?.charts?.fileTypeBreakdown?.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-2xl p-5"
                    style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
                        border: "1px solid rgba(255,255,255,0.07)"
                    }}
                >
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                        <Upload size={15} className="text-purple-400" />
                        File Type Breakdown
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {stats.charts.fileTypeBreakdown.slice(0, 10).map((t, i) => {
                            const label = t._id?.split("/")[1] || t._id || "other";
                            return (
                                <div key={i} className="p-3 rounded-xl text-center"
                                    style={{
                                        background: "rgba(255,255,255,0.03)",
                                        border: "1px solid rgba(255,255,255,0.06)"
                                    }}>
                                    <p className="text-base font-bold text-white">{t.count}</p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide truncate mt-0.5">{label}</p>
                                    <p className="text-[10px] text-gray-600 mt-0.5">{fmt(t.size)}</p>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default AdminDashboard;