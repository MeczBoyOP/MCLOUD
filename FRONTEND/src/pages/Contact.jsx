import React from "react";
import { motion } from "framer-motion";
import { Mail, MessageSquare, MapPin, Send } from "lucide-react";
import { FaGithub, FaTwitter, FaLinkedinIn } from "react-icons/fa";

const Contact = () => {
    return (
        <div className="bg-[#020617] min-h-screen text-white pt-24 pb-20 selection:bg-blue-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden -z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 blur-[150px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl sm:text-6xl font-black mb-6">Get in <span className="text-blue-500">Touch</span></h1>
                    <p className="text-gray-400 max-w-xl mx-auto text-lg">
                        Have questions about MCloud? We're here to help you optimize your digital workspace.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    
                    {/* Left: Contact Info */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-8"
                    >
                        <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl space-y-10">
                            <h2 className="text-2xl font-bold">Contact Information</h2>
                            
                            <div className="space-y-6">
                                <div className="flex items-center gap-6 group">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Email Us</p>
                                        <p className="text-lg font-medium">support@mcloud.com</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 group">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <MessageSquare size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Live Chat</p>
                                        <p className="text-lg font-medium">Available 24/7 for Enterprise</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 group">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Location</p>
                                        <p className="text-lg font-medium">Digital Workspace, The Internet</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5">
                                <p className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-widest">Follow Us</p>
                                <div className="flex gap-4">
                                    {[FaGithub, FaTwitter, FaLinkedinIn].map((Icon, i) => (
                                        <button key={i} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 transition-all">
                                            <Icon size={18} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Contact Form */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-[#0B1224] border border-white/10 rounded-[2rem] p-8 sm:p-10 shadow-2xl"
                    >
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="John Doe"
                                        className="w-full px-6 py-4 bg-[#020617] border border-white/5 rounded-2xl focus:border-blue-500 outline-none transition-all placeholder:text-gray-700" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                                    <input 
                                        type="email" 
                                        placeholder="john@example.com"
                                        className="w-full px-6 py-4 bg-[#020617] border border-white/5 rounded-2xl focus:border-blue-500 outline-none transition-all placeholder:text-gray-700" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Subject</label>
                                <select className="w-full px-6 py-4 bg-[#020617] border border-white/5 rounded-2xl focus:border-blue-500 outline-none transition-all text-gray-400">
                                    <option>General Inquiry</option>
                                    <option>Technical Support</option>
                                    <option>Enterprise Billing</option>
                                    <option>Bug Report</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Message</label>
                                <textarea 
                                    rows="4" 
                                    placeholder="How can we help?"
                                    className="w-full px-6 py-4 bg-[#020617] border border-white/5 rounded-2xl focus:border-blue-500 outline-none transition-all placeholder:text-gray-700 resize-none"
                                ></textarea>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)" }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-5 bg-blue-600 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-blue-500 transition-colors"
                            >
                                Send Message
                                <Send size={20} />
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
