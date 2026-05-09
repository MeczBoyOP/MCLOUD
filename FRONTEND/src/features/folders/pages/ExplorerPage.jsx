import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
    MoveRight, FolderTree, Layers, Zap, Shield, Keyboard, Cpu,
    FolderPlus, Move, CheckCircle, Share2, MousePointer2,
    Cloud, Lock, Sparkles, BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
    {
        title: "Drag & Drop Hierarchy",
        desc: "Reorganize folders instantly with smooth drag interactions and real-time updates.",
        icon: FolderTree,
        color: "blue"
    },
    {
        title: "Recursive Folder System",
        desc: "Handle deeply nested structures without performance loss or complexity.",
        icon: Layers,
        color: "emerald"
    },
    {
        title: "Real-Time Feedback",
        desc: "Every action responds instantly with visual clarity and system-like precision.",
        icon: Zap,
        color: "amber"
    },
    {
        title: "Role-Based Access",
        desc: "Admins and users operate with controlled permissions and structured access.",
        icon: Shield,
        color: "indigo"
    },
    {
        title: "Keyboard & Context Actions",
        desc: "Use right-click menus and shortcuts like a real operating system.",
        icon: Keyboard,
        color: "purple"
    },
    {
        title: "Modern Performance UI",
        desc: "Built with optimized rendering and smooth animations for fast workflows.",
        icon: Cpu,
        color: "cyan"
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

const FloatingObject = ({ className, delay = 0, duration = 10, scale = [1, 1.2, 1] }) => (
    <motion.div
        animate={{
            y: [0, -40, 0],
            rotate: [0, 10, -10, 0],
            scale: scale,
        }}
        transition={{
            duration: duration,
            repeat: Infinity,
            delay: delay,
            ease: "easeInOut"
        }}
        className={`absolute rounded-full blur-[80px] -z-10 ${className}`}
    />
);

const ExplorerPage = () => {
    const navigate = useNavigate();
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

    return (
        <div className="bg-[#020617] min-h-screen text-white font-sans selection:bg-blue-500/30">

            {/* ─── HERO SECTION ───────────────────────────────────────────── */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 pt-20">

                {/* 🌌 Dynamic Background Elements */}
                <FloatingObject className="w-64 h-64 bg-blue-600/20 top-[10%] left-[5%]" delay={0} />
                <FloatingObject className="w-96 h-96 bg-indigo-600/15 bottom-[10%] right-[5%]" delay={2} duration={15} scale={[1, 1.3, 1]} />
                <FloatingObject className="w-72 h-72 bg-emerald-600/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" delay={1} duration={12} />

                {/* Main Hero Container */}
                <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* LEFT: Text Content */}
                    <motion.div
                        style={{ opacity, scale }}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-8 text-center lg:text-left relative z-10"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wider uppercase">
                            <Sparkles size={14} />
                            <span>Cloud Storage Reimagined</span>
                        </div>

                        <h1 className="text-4xl sm:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight">
                            Your Storage, <br />
                            <span className="text-transparent bg-linear-to-r from-blue-400 via-indigo-400 to-blue-600 bg-clip-text">
                                Perfectly Organized
                            </span>
                        </h1>

                        <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            MCloud brings precision to your digital life. Experience a fluid,
                            recursive folder system designed for speed, security, and absolute control.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(59, 130, 246, 0.4)" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate("/register")}
                                className="group relative flex items-center gap-3 px-8 py-4 bg-blue-600 rounded-2xl text-white font-bold transition-all"
                            >
                                Get Started Free
                                <MoveRight className="group-hover:translate-x-1 transition-transform" />
                            </motion.button>

                            <motion.button
                                whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                                onClick={() => navigate("/login")}
                                className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold backdrop-blur-sm transition-all"
                            >
                                Sign In
                            </motion.button>
                        </div>

                        {/* Social Proof / Stats */}
                        <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 opacity-60 grayscale hover:grayscale-0 transition-all">
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold text-white">50GB+</span>
                                <span className="text-xs uppercase tracking-widest text-gray-500">Free Storage</span>
                            </div>
                            <div className="h-8 w-px bg-white/10" />
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold text-white">AES-256</span>
                                <span className="text-xs uppercase tracking-widest text-gray-500">Encryption</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT: Abstract UI Preview */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotateY: 15 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="relative hidden lg:block"
                    >
                        {/* Shadow Glow */}
                        <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full -z-10" />

                        {/* Main Explorer Mockup */}
                        <div className="relative bg-[#0B1224] border border-white/10 rounded-4xl p-6 shadow-2xl backdrop-blur-3xl transform perspective-1000">
                            <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                </div>
                                <div className="ml-4 h-6 w-1/2 bg-white/5 rounded-lg border border-white/5" />
                            </div>

                            <div className="grid grid-cols-12 gap-4">
                                {/* Sidebar Mockup */}
                                <div className="col-span-4 space-y-3">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className={`h-8 w-full rounded-xl flex items-center px-3 gap-2 ${i === 1 ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 text-gray-500'}`}>
                                            <div className={`w-3 h-3 rounded-sm ${i === 1 ? 'bg-blue-400' : 'bg-gray-700'}`} />
                                            <div className={`h-2 rounded ${i === 1 ? 'bg-blue-400/50 w-1/2' : 'bg-gray-800 w-2/3'}`} />
                                        </div>
                                    ))}
                                </div>

                                {/* Content Grid Mockup */}
                                <div className="col-span-8 grid grid-cols-2 gap-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <motion.div
                                            key={i}
                                            whileHover={{ y: -5, scale: 1.02 }}
                                            className="h-28 bg-[#020617] border border-white/10 rounded-2xl p-4 flex flex-col justify-between"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                <FolderTree size={16} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="h-2 bg-white/10 rounded w-3/4" />
                                                <div className="h-1.5 bg-white/5 rounded w-1/2" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Floating Interaction Labels */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-6 -right-10 p-3 bg-indigo-600/90 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl flex items-center gap-3 z-20"
                        >
                            <MousePointer2 size={18} className="text-white" />
                            <span className="text-xs font-bold whitespace-nowrap">Drag & Drop Any Folder</span>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -bottom-6 -left-10 p-3 bg-emerald-600/90 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl flex items-center gap-3 z-20"
                        >
                            <Shield size={18} className="text-white" />
                            <span className="text-xs font-bold whitespace-nowrap">Auto-Encrypted Files</span>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ─── PROCESS / HOW IT WORKS ─────────────────────────────────── */}
            <section className="relative py-24 px-4 sm:px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center space-y-4 mb-20">
                        <h2 className="text-blue-400 text-xs font-bold uppercase tracking-[0.3em]">The MCloud Workflow</h2>
                        <h3 className="text-3xl sm:text-5xl font-bold">Simplifying Complexity</h3>
                        <p className="text-gray-500 max-w-xl mx-auto">From upload to secure sharing, every step is optimized for the modern digital era.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step, i) => {
                            const Icon = step.icon;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all group"
                                >
                                    <div className="absolute top-0 right-0 p-4 text-4xl font-black text-white/5 group-hover:text-blue-500/10 transition-colors">
                                        0{i + 1}
                                    </div>
                                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                                        <Icon size={28} />
                                    </div>
                                    <h4 className="text-xl font-bold mb-3">{step.title}</h4>
                                    <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ─── INTERACTIVE FEATURES GRID ──────────────────────────────── */}
            <section className="relative py-24 px-4 sm:px-6 bg-linear-to-b from-transparent via-blue-900/5 to-transparent">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-end mb-20">
                        <div className="lg:col-span-2 space-y-6">
                            <h2 className="text-3xl sm:text-5xl font-bold leading-tight">
                                Powerful Features for <br />
                                <span className="text-blue-500">Unmatched Performance</span>
                            </h2>
                            <p className="text-gray-400 text-lg max-w-2xl">
                                We've packed MCloud with features that give you the power of a desktop operating
                                system right inside your modern web browser.
                            </p>
                        </div>
                        <div className="flex justify-start lg:justify-end pb-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 text-blue-400 font-bold hover:text-blue-300 transition-colors"
                            >
                                View Detailed Docs <MoveRight size={20} />
                            </motion.button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{ y: -8 }}
                                    className="group relative h-full"
                                >
                                    <div className="h-full p-8 rounded-[2.5rem] bg-[#0B1224]/80 backdrop-blur-xl border border-white/5 hover:border-white/20 transition-all duration-500 shadow-xl overflow-hidden">
                                        {/* Background Accent */}
                                        <div className={`absolute top-0 right-0 w-32 h-32 bg-${item.color}-500/10 blur-[50px] -z-10 group-hover:bg-${item.color}-500/20 transition-colors`} />

                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-${item.color}-400 bg-${item.color}-500/10 mb-6 group-hover:scale-110 transition-transform`}>
                                            <Icon size={24} />
                                        </div>

                                        <h3 className="text-xl font-bold mb-4 tracking-tight group-hover:text-blue-400 transition-colors">{item.title}</h3>
                                        <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>

                                        <div className="mt-8 flex items-center gap-2 text-xs font-bold text-gray-600 group-hover:text-blue-400/60 transition-colors">
                                            <span>Learn More</span>
                                            <div className="h-px flex-1 bg-white/5" />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ─── CALL TO ACTION ────────────────────────────────────────── */}
            <section className="relative py-24 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative p-12 sm:p-20 rounded-[3rem] bg-linear-to-br from-blue-600 to-indigo-700 overflow-hidden shadow-[0_30px_100px_rgba(37,99,235,0.3)]"
                    >
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 blur-[80px] rounded-full -translate-x-1/2 translate-y-1/2" />

                        <div className="relative z-10 text-center space-y-8">
                            <h2 className="text-4xl sm:text-6xl font-black text-white leading-tight">
                                Ready to take <br />
                                <span className="opacity-80">control of your data?</span>
                            </h2>
                            <p className="text-blue-100/80 text-lg max-w-xl mx-auto">
                                Join thousands of creators and professionals who trust MCloud
                                for their digital workspace organization.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate("/register")}
                                    className="px-10 py-5 bg-white text-blue-600 rounded-2xl font-black text-lg shadow-xl shadow-black/10 hover:bg-blue-50 transition-colors"
                                >
                                    Start Exploring Now
                                </motion.button>
                                <div className="flex items-center gap-4 text-white/80">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-blue-600 bg-blue-400 flex items-center justify-center text-[10px] font-bold">U{i}</div>
                                        ))}
                                    </div>
                                    <span className="text-sm font-medium">Joined by 2k+ users</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ─── FOOTER ─────────────────────────────────────────────────── */}
            <footer className="py-12 border-t border-white/5 text-center px-4">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex items-center justify-center gap-2 text-2xl font-black">
                        <Cloud className="text-blue-500" />
                        <span>MCloud</span>
                    </div>
                    <p className="text-gray-500 text-sm">© {new Date().getFullYear()} MCloud Inc. Built for the modern web.</p>
                    <div className="flex items-center justify-center gap-6 text-gray-500 text-xs font-bold uppercase tracking-widest">
                        <a href="#" className="hover:text-blue-400 transition">Privacy</a>
                        <a href="#" className="hover:text-blue-400 transition">Terms</a>
                        <a href="#" className="hover:text-blue-400 transition">Contact</a>
                    </div>
                </div>
            </footer>

            {/* 🔧 PERSISTENT OVERLAYS (GLASS MORPHISM) */}
            <div className="fixed bottom-6 left-6 z-50 pointer-events-none">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 flex items-center gap-3 shadow-2xl">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">System Live</span>
                </div>
            </div>

        </div>
    );
};

export default ExplorerPage;