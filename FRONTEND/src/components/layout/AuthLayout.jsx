import React from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import AssetsPath from "../../assets/AssetsPath";

const AuthLayout = () => {
    return (
        <div className="min-h-screen grid md:grid-cols-2 text-white">

            {/* LEFT — FORM PANEL */}
            <div className="flex items-center justify-center px-6 py-10">
                <div className="w-full max-w-md">
                    <Outlet />
                </div>
            </div>

            {/* RIGHT — BRAND PANEL */}
            <div className="hidden md:flex relative overflow-hidden">

                {/* 🌌 Background */}
                <div className="absolute inset-0 bg-[#020617]" />

                {/* Soft gradients */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.15),transparent_40%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(0,51,102,0.25),transparent_50%)]" />

                {/* ✂️ CLIPPED SHAPE CONTAINER */}
                <div className="
    absolute inset-0
    [clip-path:polygon(20%_0%,100%_0%,100%_100%,0%_100%)]
    bg-white/2
    backdrop-blur-sm
  " />

                {/* 🧠 CONTENT */}
                <div className="relative z-10 flex flex-col justify-start p-12 max-w-lg">

                    <h2 className="text-3xl font-semibold leading-tight mb-6">
                        Organize Your Workspace with Precision
                    </h2>

                    <p className="text-gray-400 text-sm mb-6">
                        A modern file system built for speed, clarity, and control.
                    </p>

                    <div className="text-sm text-gray-300">
                        “This completely changed how I manage my projects.”
                        <div className="text-xs text-gray-500 mt-2">
                            — Frontend Developer
                        </div>
                    </div>
                </div>

                {/* 🎨 ILLUSTRATION */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute bottom-6 right-6 w-[340px]"
                >
                    <motion.img
                        src={AssetsPath.AuthIllustration}
                        alt="Illustration"
                        className="w-full h-auto"
                        animate={{ y: [0, -12, 0] }}
                        transition={{ duration: 6, repeat: Infinity }}
                    />
                </motion.div>

            </div>
        </div>
    );
};

export default AuthLayout;