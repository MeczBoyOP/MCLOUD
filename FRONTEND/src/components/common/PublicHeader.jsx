import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

const PublicHeader = () => {
    const [open, setOpen] = useState(false);
    const { user } = useAuth();

    const CtaButton = () => (
        <Link to={user ? "/user/dashboard" : "/login"}>
            <button className="
                px-4 py-1.5 rounded-full text-sm
                bg-white/5 backdrop-blur-xl
                border border-white/10
                text-gray-300
                transition-all duration-300
                hover:text-white
                hover:border-blue-500/40
                hover:shadow-[0_0_15px_rgba(37,99,235,0.3)]
                active:scale-95
            ">
                {user ? "Dashboard" : "Login"}
            </button>
        </Link>
    );

    return (
        <header className="
      sticky top-0 z-50
      bg-[#020617]/80 backdrop-blur-xl
      border-b border-white/10
    ">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="text-sm sm:text-base font-semibold tracking-tight">
                    M<span className="text-blue-400">Cloud</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8 text-sm text-gray-400">
                    <a href="#features" className="hover:text-white transition">Features</a>
                    <a href="#workflow" className="hover:text-white transition">Workflow</a>
                    <a href="#contact" className="hover:text-white transition">Contact</a>
                </nav>

                {/* CTA */}
                <div className="hidden md:block">
                    <CtaButton />
                </div>

                {/* Mobile Toggle */}
                <button
                    onClick={() => setOpen(!open)}
                    className="md:hidden text-gray-300 active:scale-90 transition"
                >
                    {open ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="
              md:hidden px-4 pb-4
              border-t border-white/10
              bg-[#020617]/95 backdrop-blur-xl
            "
                    >
                        <div className="flex flex-col gap-4 text-sm text-gray-300 mt-4">

                            <a href="#features" onClick={() => setOpen(false)}>Features</a>
                            <a href="#workflow" onClick={() => setOpen(false)}>Workflow</a>
                            <a href="#contact" onClick={() => setOpen(false)}>Contact</a>

                            <CtaButton />

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default PublicHeader;