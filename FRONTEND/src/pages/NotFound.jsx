import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";

const NotFound = () => {
    return (
        <div className="relative min-h-screen flex items-center justify-center text-white px-4 overflow-hidden">

            {/* 🌌 Background */}
            <div className="absolute inset-0 -z-10 bg-[#020617]" />
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_30%,rgba(37,99,235,0.15),transparent_40%),radial-gradient(circle_at_70%_70%,rgba(0,51,102,0.25),transparent_50%)]" />

            {/* 💡 Floating Glow Orbs */}
            <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="absolute w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full top-[-50px] left-[-50px]"
            />
            <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 7, repeat: Infinity }}
                className="absolute w-72 h-72 bg-indigo-500/20 blur-[120px] rounded-full bottom-[-60px] right-[-60px]"
            />

            {/* 📦 Content */}
            <div className="max-w-xl text-center space-y-6">

                {/* 🔢 404 Number */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-6xl sm:text-8xl font-bold tracking-tight"
                >
                    <span className="bg-linear-to-r from-blue-400 via-indigo-500 to-blue-700 bg-clip-text text-transparent">
                        404
                    </span>
                </motion.h1>

                {/* 🧠 Heading */}
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl sm:text-2xl font-semibold"
                >
                    Page not found
                </motion.h2>

                {/* 📄 Description */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-400 text-sm sm:text-base"
                >
                    The page you’re looking for doesn’t exist or may have been moved.
                    Let’s get you back on track.
                </motion.p>

                {/* 🔘 CTA Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex justify-center pt-4"
                >
                    <Link to="/">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="
                group flex items-center gap-3
                px-6 py-3 rounded-full

                bg-white/5 backdrop-blur-xl
                border border-white/10

                text-sm sm:text-base

                transition-all duration-300

                hover:border-blue-500/40
                hover:shadow-[0_0_30px_rgba(37,99,235,0.3)]

                active:shadow-[inset_0_0_12px_rgba(0,0,0,0.8)]
              "
                        >
                            Back to Home

                            <div className="
                w-9 h-9 rounded-full 
                bg-white/10
                flex items-center justify-center
                transition-all duration-300
                group-hover:bg-blue-500
                group-hover:-rotate-45
              ">
                                <MoveRight className="w-4 h-4" />
                            </div>
                        </motion.button>
                    </Link>
                </motion.div>

                {/* 🧾 Footer Hint */}
                <p className="text-xs text-gray-500 pt-4">
                    Error code: 404 • Resource not found
                </p>
            </div>
        </div>
    );
};

export default NotFound;