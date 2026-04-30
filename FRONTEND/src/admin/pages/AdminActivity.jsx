import React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Upload, UserPlus, RefreshCw, Activity } from "lucide-react";
import { getRecentActivity } from "../../features/admin/adminAPI";
import { useQueryClient } from "@tanstack/react-query";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const fmt = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const s = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${s[i]}`;
};

const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const s = Math.floor(diff / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

/* ─── Activity Item ───────────────────────────────────────────────────────── */
const ActivityItem = ({ item, index }) => {
    const isUpload = item.type === "upload";

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className="flex items-start gap-4 py-4 border-b last:border-0"
            style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
            {/* Icon */}
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={isUpload
                    ? { background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.2)" }
                    : { background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.2)" }
                }>
                {isUpload
                    ? <Upload size={16} className="text-amber-400" />
                    : <UserPlus size={16} className="text-blue-400" />
                }
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-sm text-white">
                    {isUpload ? (
                        <>
                            <Link to={`/admin/users/${item.user?._id}`}
                                className="font-medium text-blue-400 hover:underline">
                                {item.user?.name || "Unknown"}
                            </Link>
                            {" uploaded "}
                            <span className="text-gray-300 font-medium truncate">
                                "{item.file?.name}"
                            </span>
                        </>
                    ) : (
                        <>
                            <Link to={`/admin/users/${item.user?._id}`}
                                className="font-medium text-blue-400 hover:underline">
                                {item.user?.name || "Someone"}
                            </Link>
                            {" joined MCloud"}
                        </>
                    )}
                </p>
                <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-gray-500">{item.user?.email}</p>
                    {isUpload && item.file?.size && (
                        <span className="text-[10px] text-gray-600">{fmt(item.file.size)}</span>
                    )}
                </div>
            </div>

            {/* Time */}
            <span className="text-xs text-gray-600 shrink-0 mt-0.5">{timeAgo(item.createdAt)}</span>
        </motion.div>
    );
};

/* ─── Main Page ───────────────────────────────────────────────────────────── */
const AdminActivity = () => {
    const qc = useQueryClient();

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ["admin", "activity"],
        queryFn: () => getRecentActivity({ limit: 50 }),
        refetchInterval: 30_000,
    });

    const activity = data?.data?.activity || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Activity size={22} className="text-blue-400" />
                        Recent Activity
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Live feed of uploads and signups · auto-refreshes every 30s
                    </p>
                </div>
                <button
                    onClick={() => qc.invalidateQueries(["admin", "activity"])}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {/* Activity feed */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-5"
                style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
                    border: "1px solid rgba(255,255,255,0.07)"
                }}
            >
                {/* Legend */}
                <div className="flex items-center gap-4 mb-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="w-3 h-3 rounded-full bg-amber-400" /> File Upload
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="w-3 h-3 rounded-full bg-blue-400" /> New Signup
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : activity.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-12">No activity yet</p>
                ) : (
                    <div>
                        {activity.map((item, i) => (
                            <ActivityItem key={`${item.type}-${i}`} item={item} index={i} />
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default AdminActivity;
