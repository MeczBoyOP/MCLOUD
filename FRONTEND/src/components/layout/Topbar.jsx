// Topbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Search, Menu, LogOut, User, UserCircle, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Topbar = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [dropdown, setDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropRef = useRef(null);

    useEffect(() => {
        const h = (e) => { if (!dropRef.current?.contains(e.target)) setDropdown(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const handleSearch = (e) => {
        if (e.key === "Enter" && searchQuery.trim()) {
            setOpen(false);
        }
    };

    const initials = (user?.name || "?").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    const profilePath = user?.role === "admin" ? "/admin/profile" : "/user/profile";

    return (
        <>
            <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-white/10 shrink-0">

                {/* Left */}
                <div className="flex items-center gap-4">
                    <button onClick={onMenuClick} className="md:hidden text-gray-400 hover:text-white transition">
                        <Menu size={20} />
                    </button>

                    <button
                        onClick={() => setOpen(true)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition"
                    >
                        <Search size={16} />
                        <span className="text-sm hidden sm:block">Search files...</span>
                    </button>
                </div>

                {/* Right */}
                <div ref={dropRef} className="relative">
                    <button
                        onClick={() => setDropdown(d => !d)}
                        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-white/5 transition"
                    >
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {user?.avatar
                                ? <img src={user.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
                                : initials}
                        </div>
                        <span className="text-sm text-gray-300 hidden md:block max-w-[120px] truncate">{user?.name}</span>
                        <ChevronDown size={14} className={`text-gray-500 transition-transform hidden md:block ${dropdown ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                        {dropdown && (
                            <motion.div
                                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-full mt-2 w-52 bg-[#0f0f18] border border-white/10 rounded-xl shadow-2xl py-1 z-50 overflow-hidden"
                            >
                                <div className="px-4 py-3 border-b border-white/10">
                                    <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                </div>
                                <button
                                    onClick={() => { setDropdown(false); navigate(profilePath); }}
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition"
                                >
                                    <UserCircle size={15} className="text-blue-400" />
                                    My Profile
                                </button>
                                <div className="border-t border-white/10 mt-1" />
                                <button
                                    onClick={() => { setDropdown(false); logout(); }}
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition"
                                >
                                    <LogOut size={15} />
                                    Log Out
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </header>

            {/* 🔍 SEARCH MODAL */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        onClick={() => setOpen(false)}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            onClick={e => e.stopPropagation()}
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="w-full max-w-lg bg-[#0f0f18] border border-white/10 rounded-2xl p-4 shadow-2xl"
                        >
                            <div className="flex items-center gap-3 mb-1">
                                <Search size={16} className="text-gray-400" />
                                <input
                                    autoFocus
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onKeyDown={handleSearch}
                                    placeholder="Search files and folders..."
                                    className="flex-1 bg-transparent text-white outline-none placeholder-gray-500 text-sm"
                                />
                            </div>
                            <p className="text-xs text-gray-600 mt-2">Press Enter to search · Escape to close</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Topbar;