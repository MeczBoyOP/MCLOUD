// Topbar.jsx
import React, { useState } from "react";
import { Search, Menu, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Topbar = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e) => {
        if (e.key === "Enter" && searchQuery.trim()) {
            setOpen(false);
            // Ideally navigate to a search page or apply query to MyFiles
            // navigate(`/user/files?search=${searchQuery}`);
        }
    };

    return (
        <>
            <header className="h-14 flex items-center justify-between px-6 border-b border-white/10">

                {/* Left */}
                <div className="flex items-center gap-4">
                    <button onClick={onMenuClick} className="md:hidden">
                        <Menu />
                    </button>

                    <button
                        onClick={() => setOpen(true)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white"
                    >
                        <Search size={16} />
                        <span className="text-sm">Search files...</span>
                    </button>
                </div>

                {/* Right */}
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-300 hidden md:block">{user?.name}</span>
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <User size={16} />
                    </div>
                    <button onClick={logout} className="text-gray-400 hover:text-red-400 transition" title="Log out">
                        <LogOut size={16} />
                    </button>
                </div>

            </header>

            {/* 🔍 SEARCH MODAL */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        onClick={() => setOpen(false)}
                        className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center pt-15 px-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            onClick={e => e.stopPropagation()}
                            initial={{ y: -40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -40, opacity: 0 }}
                            className="w-full max-w-lg bg-[#020617] border border-white/10 rounded-xl p-4 mt-20"
                        >
                            <input
                                autoFocus
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                                placeholder="Search... (Press enter)"
                                className="w-full p-2 bg-white/5 border border-white/10 text-white rounded outline-none focus:border-blue-500 transition"
                            />

                            <button
                                onClick={() => setOpen(false)}
                                className="mt-4 text-xs text-blue-400"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Topbar;