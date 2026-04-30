import { MoveRight } from "lucide-react";
import { motion } from "framer-motion";

import { FolderTree, Layers, Zap, Shield, Keyboard, Cpu, FolderPlus, Move, CheckCircle } from "lucide-react";

const features = [
    {
        title: "Drag & Drop Hierarchy",
        desc: "Reorganize folders instantly with smooth drag interactions and real-time updates.",
        icon: FolderTree,
    },
    {
        title: "Recursive Folder System",
        desc: "Handle deeply nested structures without performance loss or complexity.",
        icon: Layers,
    },
    {
        title: "Real-Time Feedback",
        desc: "Every action responds instantly with visual clarity and system-like precision.",
        icon: Zap,
    },
    {
        title: "Role-Based Access",
        desc: "Admins and users operate with controlled permissions and structured access.",
        icon: Shield,
    },
    {
        title: "Keyboard & Context Actions",
        desc: "Use right-click menus and shortcuts like a real operating system.",
        icon: Keyboard,
    },
    {
        title: "Modern Performance UI",
        desc: "Built with optimized rendering and smooth animations for fast workflows.",
        icon: Cpu,
    },
];

const steps = [
    {
        title: "Create Structure",
        desc: "Start by creating folders and defining your workspace hierarchy.",
        icon: FolderPlus,
    },
    {
        title: "Organize & Arrange",
        desc: "Drag and drop folders to build a structured and intuitive layout.",
        icon: Move,
    },
    {
        title: "Manage Hierarchy",
        desc: "Handle nested folders with full control and real-time updates.",
        icon: Layers,
    },
    {
        title: "Work Efficiently",
        desc: "Navigate, edit, and manage your system with speed and precision.",
        icon: CheckCircle,
    },
];

const ExplorerPage = () => {
    return (
        <div>
            <div className="relative min-h-screen w-full overflow-hidden text-white flex items-center justify-center px-4 sm:px-6">

                {/* 🌌 Background */}
                <div className="absolute inset-0 -z-10 bg-[#020617]" />
                <div className="absolute inset-0 -z-10 
        bg-[radial-gradient(circle_at_25%_25%,rgba(37,99,235,0.15),transparent_40%),radial-gradient(circle_at_75%_75%,rgba(0,51,102,0.25),transparent_50%)]"
                />

                {/* 💡 Ambient Glow */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="absolute -z-10 w-[500px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full top-[-120px] left-[-120px]"
                />

                {/* 📦 Content */}
                <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

                    {/* 🧠 LEFT CONTENT */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-6"
                    >
                        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight">
                            Manage Your{" "}
                            <span className="text-transparent bg-linear-to-r from-indigo-400 via-emerald-500 to-emerald-700 bg-clip-text">
                                Digital Workspace
                            </span>
                        </h1>

                        <p className="text-sm sm:text-base text-gray-400 max-w-lg leading-relaxed">
                            A modern file system experience built for speed and control.
                            Organize folders, manage hierarchy, and navigate your data
                            with precision — all inside your browser.
                        </p>

                        <p className="text-xs sm:text-sm text-gray-500 max-w-md">
                            Designed for developers, creators, and teams who need structured workflows
                            without complexity.
                        </p>

                        {/* 🧊 Glass Button */}
                        <motion.button
                            whileHover={{ scale: 1 }}
                            whileTap={{ scale: 0.96 }}
                            className="
              group relative flex items-center justify-between gap-3 max-w-xs w-full
              px-5 py-2 rounded-full
              bg-white/5 backdrop-blur-xl
              border border-white/10
              text-white text-sm sm:text-base
              transition-all duration-300

              hover:border-blue-500/40
              hover:shadow-[0_0_25px_rgba(37,99,235,0.3)]
              active:shadow-[inset_0_0_14px_rgba(0,0,0,0.8)]
            "
                        >
                            Launch Explorer

                            <div className="
              w-9 h-9 rounded-full 
              bg-white/10 backdrop-blur-md
              flex items-center justify-center
              transition-all duration-300
              group-hover:bg-blue-500
              group-hover:-rotate-45
            ">
                                <MoveRight className="text-white w-4 h-4" />
                            </div>
                        </motion.button>
                    </motion.div>

                    {/* 🎨 RIGHT SIDE (3D UI ILLUSION) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >

                        {/* Main Glass Panel */}
                        <div className="
            rounded-2xl p-4 bg-white/5 backdrop-blur-xl
            border border-white/10
            shadow-[0_20px_80px_rgba(0,0,0,0.6)]
          ">

                            {/* Top Bar */}
                            <div className="flex gap-2 mb-4">
                                <div className="w-3 h-3 bg-red-500 rounded-full" />
                                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                                <div className="w-3 h-3 bg-green-500 rounded-full" />
                            </div>

                            {/* Explorer Layout */}
                            <div className="flex gap-3">

                                {/* Sidebar */}
                                <div className="w-1/3 space-y-2">
                                    {["Root", "Projects", "Assets", "Design"].map((item, i) => (
                                        <div
                                            key={i}
                                            className="
                      px-2 py-1.5 rounded-md text-xs
                      bg-[#020617]
                      shadow-[inset_0_0_8px_rgba(0,0,0,0.8)]
                    "
                                        >
                                            {item}
                                        </div>
                                    ))}
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 grid grid-cols-2 gap-2">
                                    {[...Array(4)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="
                      p-2 text-xs rounded-md
                      bg-[#020617]
                      shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]
                    "
                                        >
                                            Folder {i + 1}
                                        </div>
                                    ))}
                                </div>

                            </div>
                        </div>

                        {/* Floating Layer (Fake 3D Depth) */}
                        <div className="
            absolute -bottom-6 -right-6 w-full h-full
            rounded-2xl bg-blue-500/10 blur-2xl -z-10
          " />

                    </motion.div>
                </div>


            </div>

            {/* ================= FEATURES SECTION ================= */}
            <section className="relative w-full py-20 px-4 sm:px-6 text-white">

                {/* 🌌 Section Glow */}
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.08),transparent_70%)]" />

                <div className="max-w-6xl mx-auto">

                    {/* 🧠 Heading */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-2xl sm:text-4xl font-semibold">
                            Built for
                            <span className="text-transparent bg-linear-to-r from-purple-200 via-purple-500 to-purple-900 bg-clip-text" > Speed</span>
                            , Designed for
                            <span className="text-transparent bg-linear-to-r from-purple-200 via-purple-500 to-purple-900 bg-clip-text"> Control</span>
                        </h2>
                        <p className="text-gray-400 mt-4 text-sm sm:text-base max-w-xl mx-auto">
                            Experience a structured, intuitive way to manage your digital workspace with
                            real-time interactions and powerful hierarchy control.
                        </p>
                    </motion.div>

                    {/* 🎯 Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

                        {features.map((item, i) => {
                            const Icon = item.icon;

                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.04 }}
                                    whileHover={{ y: -4 }}
                                    className="group relative"
                                >
                                    {/* 🧊 Card */}
                                    <div
                                        className="
            relative h-full p-6 rounded-2xl

            bg-[#0B1220]/80 backdrop-blur-xl
            border border-white/10

            transition-all duration-300

            group-hover:border-white/20
            group-hover:bg-[#0B1220]
            group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]
          "
                                    >
                                        {/* 🔹 Icon Row */}
                                        <div className="flex items-center justify-between mb-5">

                                            <div
                                                className="
                w-10 h-10 rounded-lg
                flex items-center justify-center

                bg-white/5
                text-blue-400

                transition-all duration-300
                group-hover:bg-blue-500/10
                group-hover:text-blue-300
              "
                                            >
                                                <Icon className="w-5 h-5" />
                                            </div>

                                            {/* subtle arrow indicator */}
                                            <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition">
                                                →
                                            </div>
                                        </div>

                                        {/* 📝 Title */}
                                        <h3 className="text-base font-semibold mb-2 tracking-tight">
                                            {item.title}
                                        </h3>

                                        {/* 📄 Description */}
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            {item.desc}
                                        </p>

                                        {/* subtle divider */}
                                        <div className="
            mt-6 h-px w-full
            bg-linear-to-r from-transparent via-white/10 to-transparent
          " />
                                    </div>
                                </motion.div>
                            );
                        })}

                    </div>
                </div>
            </section>

            {/* ================= HOW IT WORKS SECTION ================= */}
            <section className="relative w-full py-24 px-4 sm:px-6 text-white">

                {/* 🌌 Background Glow */}
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.06),transparent_70%)]" />

                <div className="max-w-6xl mx-auto">

                    {/* 🧠 Heading */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-2xl sm:text-4xl font-semibold">
                            A Simple Workflow, Built for Efficiency
                        </h2>
                        <p className="text-gray-400 mt-4 text-sm sm:text-base max-w-xl mx-auto">
                            From structure to execution — manage your entire workflow with clarity and control.
                        </p>
                    </motion.div>

                    {/* 🧩 Steps */}
                    <div className="relative">

                        {/* Vertical line (desktop) */}
                        <div className="hidden md:block absolute left-1/2 top-0 h-full w-px bg-white/10 -translate-x-1/2" />

                        <div className="space-y-12">

                            {steps.map((step, i) => {
                                const Icon = step.icon;
                                const isLeft = i % 2 === 0;

                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.05 }}
                                        className={`flex flex-col md:flex-row items-center gap-6 md:gap-10 ${isLeft ? "md:flex-row" : "md:flex-row-reverse"
                                            }`}
                                    >
                                        {/* Content Card */}
                                        <div className="w-full md:w-1/2">
                                            <div className="
                  p-6 rounded-2xl
                  bg-[#0B1220]/80 backdrop-blur-xl
                  border border-white/10
                  transition-all duration-300
                  hover:border-white/20
                  hover:shadow-[0_10px_40px_rgba(0,0,0,0.6)]
                ">
                                                <h3 className="text-lg font-semibold mb-2">
                                                    {step.title}
                                                </h3>
                                                <p className="text-sm text-gray-400 leading-relaxed">
                                                    {step.desc}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Center Icon */}
                                        <div className="relative z-10 flex items-center justify-center">
                                            <div className="
                  w-12 h-12 rounded-xl
                  bg-white/5 border border-white/10
                  flex items-center justify-center
                  text-blue-400
                  backdrop-blur
                ">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                        </div>

                                        {/* Spacer */}
                                        <div className="hidden md:block w-1/2" />
                                    </motion.div>
                                );
                            })}

                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default ExplorerPage;