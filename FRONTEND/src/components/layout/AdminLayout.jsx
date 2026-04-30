import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard, Users, FileText, Activity,
    Shield, LogOut, Menu, X, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/users",     label: "Users",     icon: Users },
    { path: "/admin/files",     label: "Files",     icon: FileText },
    { path: "/admin/activity",  label: "Activity",  icon: Activity },
];

const AdminSidebar = ({ onClose }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success("Logged out");
        navigate("/login");
    };

    return (
        <div className="h-full flex flex-col" style={{
            background: "linear-gradient(180deg, #0a0f1e 0%, #020617 100%)",
            borderRight: "1px solid rgba(255,255,255,0.06)"
        }}>
            {/* Logo */}
            <div className="p-5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #2563eb, #1e40af)" }}>
                        <Shield size={16} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-white">MCloud</h1>
                        <p className="text-[10px] text-blue-400 font-medium tracking-wider uppercase">Admin Panel</p>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition md:hidden">
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Admin Badge */}
            <div className="mx-4 mb-4 p-3 rounded-xl" style={{
                background: "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(37,99,235,0.05))",
                border: "1px solid rgba(37,99,235,0.2)"
            }}>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
                        {user?.name?.charAt(0)?.toUpperCase() || "A"}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                        <p className="text-xs text-blue-400 truncate">{user?.email}</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                <p className="text-[10px] text-gray-600 uppercase tracking-widest px-2 mb-2">Navigation</p>
                {navItems.map(({ path, label, icon: Icon }) => (
                    <NavLink
                        key={path}
                        to={path}
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                                isActive
                                    ? "text-blue-400 shadow-lg"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`
                        }
                        style={({ isActive }) => isActive ? {
                            background: "linear-gradient(90deg, rgba(37,99,235,0.2), rgba(37,99,235,0.05))",
                            border: "1px solid rgba(37,99,235,0.2)",
                            boxShadow: "inset 0 0 20px rgba(37,99,235,0.1)"
                        } : {}}
                    >
                        <Icon size={17} className="shrink-0" />
                        <span className="flex-1">{label}</span>
                        <ChevronRight size={13} className="opacity-0 group-hover:opacity-50 transition" />
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 shrink-0 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

const AdminLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="h-screen flex overflow-hidden" style={{ background: "#020617" }}>
            {/* Mobile overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-black/60 z-40 md:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.aside
                            className="fixed left-0 top-0 h-full w-72 z-50 md:hidden"
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25 }}
                        >
                            <AdminSidebar onClose={() => setMobileOpen(false)} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop sidebar */}
            <aside className="w-60 hidden md:block shrink-0">
                <AdminSidebar />
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="shrink-0 flex items-center gap-4 px-6 py-4" style={{
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(2,6,23,0.8)",
                    backdropFilter: "blur(12px)"
                }}>
                    <button
                        className="md:hidden text-gray-400 hover:text-white transition"
                        onClick={() => setMobileOpen(true)}
                    >
                        <Menu size={20} />
                    </button>
                    <div className="flex-1">
                        <p className="text-xs text-gray-500">MCloud / Admin</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs text-gray-400">System Online</span>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
