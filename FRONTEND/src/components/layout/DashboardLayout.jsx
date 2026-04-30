// DashboardLayout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { AnimatePresence, motion } from "framer-motion";

const DashboardLayout = () => {
    const [open, setOpen] = useState(false);

    return (
        <div className="h-screen flex bg-black text-white overflow-hidden">

            {/* 📱 Mobile Sidebar */}
            <AnimatePresence>
                {open && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            onClick={() => setOpen(false)}
                            className="fixed inset-0 bg-black/50 z-40 md:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            className="fixed z-50 w-[70%] max-w-xs h-full bg-black border-r border-white/10 md:hidden"
                        >
                            <Sidebar />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* 🧭 Desktop Sidebar */}
            <aside className="w-[240px] border-r border-white/10 hidden md:block">
                <Sidebar />
            </aside>

            {/* 📦 MAIN */}
            <div className="flex-1 flex flex-col">

                <Topbar onMenuClick={() => setOpen(true)} />

                <main className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="max-w-[1400px] mx-auto">
                        <Outlet />
                    </div>
                </main>

            </div>
        </div>
    );
};

export default DashboardLayout;