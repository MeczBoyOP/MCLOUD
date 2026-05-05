import React from "react";
import { motion } from "framer-motion";
import { 
    Zap, Shield, Cloud, Lock, Search, Share2, 
    HardDrive, RefreshCw, Smartphone, Monitor,
    Cpu, Layers, FolderTree, Database
} from "lucide-react";

const featureGroups = [
    {
        category: "Storage & Core",
        items: [
            { title: "Recursive Folders", desc: "Infinite nesting for complex data structures.", icon: FolderTree },
            { title: "Smart Caching", desc: "Ultra-fast folder navigation with local state management.", icon: Zap },
            { title: "Real-time Sync", desc: "Your files are always up to date across all devices.", icon: RefreshCw },
        ]
    },
    {
        category: "Security & Privacy",
        items: [
            { title: "AES-256 Encryption", desc: "Military-grade encryption for every single file.", icon: Shield },
            { title: "Private PIN Access", desc: "Secondary security layer for sensitive folders.", icon: Lock },
            { title: "Zero Knowledge", desc: "Even we can't see your data. Complete privacy.", icon: Database },
        ]
    },
    {
        category: "Accessibility",
        items: [
            { title: "Universal Access", desc: "Optimized for mobile, tablet, and desktop views.", icon: Smartphone },
            { title: "Quick Share", desc: "Generate secure QR codes or links instantly.", icon: Share2 },
            { title: "Global Search", desc: "Find any file across thousands of folders in milliseconds.", icon: Search },
        ]
    }
];

const Features = () => {
    return (
        <div className="bg-[#020617] min-h-screen text-white pt-20 pb-20 selection:bg-blue-500/30">
            {/* 🌌 Background Glow */}
            <div className="fixed inset-0 overflow-hidden -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4 mb-24"
                >
                    <h1 className="text-4xl sm:text-6xl font-black">
                        Engineered for <br />
                        <span className="text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text">Ultimate Performance</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        MCloud isn't just another storage provider. We've rebuilt the file system 
                        experience from the ground up for the modern web.
                    </p>
                </motion.div>

                {/* Main Feature Sections */}
                <div className="space-y-32">
                    {featureGroups.map((group, groupIdx) => (
                        <div key={groupIdx} className="space-y-12">
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="flex items-center gap-4"
                            >
                                <div className="h-px flex-1 bg-white/5" />
                                <h2 className="text-sm font-bold uppercase tracking-[0.4em] text-blue-500/60 whitespace-nowrap">
                                    {group.category}
                                </h2>
                                <div className="h-px flex-1 bg-white/5" />
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {group.items.map((item, i) => {
                                    const Icon = item.icon;
                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.1 }}
                                            whileHover={{ y: -5 }}
                                            className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/40 transition-all backdrop-blur-sm"
                                        >
                                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <Icon size={24} />
                                            </div>
                                            <h3 className="text-xl font-bold mb-3 tracking-tight">{item.title}</h3>
                                            <p className="text-gray-500 leading-relaxed text-sm">
                                                {item.desc}
                                            </p>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tech Stack Spotlight */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-40 p-12 rounded-[3rem] bg-gradient-to-br from-[#0B1224] to-[#020617] border border-white/10 text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                    
                    <h2 className="text-3xl font-bold mb-8">Built with Modern Tech</h2>
                    <div className="flex flex-wrap justify-center gap-8 opacity-40 hover:opacity-100 transition-opacity">
                        {['Node.js', 'React 18', 'MongoDB', 'Redis', 'AES-256', 'JWT'].map(tech => (
                            <span key={tech} className="text-lg font-black tracking-widest">{tech}</span>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Features;
