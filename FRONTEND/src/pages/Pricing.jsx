import React from "react";
import { motion } from "framer-motion";
import { Check, Zap, Shield, Crown, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const plans = [
    {
        name: "Free",
        price: "$0",
        desc: "Perfect for students and casual users.",
        features: ["5GB Storage", "Recursive Folders", "Mobile Access", "Standard Support"],
        cta: "Start for Free",
        highlight: false,
        icon: Zap
    },
    {
        name: "Pro",
        price: "$12",
        desc: "The choice for power users and creators.",
        features: ["50GB Storage", "AES-256 Encryption", "Private PIN Folders", "Priority Support", "QR Share Codes"],
        cta: "Upgrade to Pro",
        highlight: true,
        icon: Star
    },
    {
        name: "Enterprise",
        price: "Custom",
        desc: "Advanced security for teams and scaling systems.",
        features: ["Unlimited Storage", "Custom Role Permissions", "24/7 Dedicated Support", "Audit Logs", "SLA Guarantee"],
        cta: "Contact Sales",
        highlight: false,
        icon: Crown
    }
];

const Pricing = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-[#020617] min-h-screen text-white pt-24 pb-20 selection:bg-blue-500/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-20"
                >
                    <h1 className="text-4xl sm:text-6xl font-black mb-6">Simple, Transparent <br /><span className="text-blue-500">Pricing</span></h1>
                    <p className="text-gray-400 max-w-xl mx-auto text-lg">
                        Choose the plan that fits your storage needs. No hidden fees, just pure performance.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                    {plans.map((plan, i) => {
                        const Icon = plan.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -10 }}
                                className={`relative p-10 rounded-[3rem] flex flex-col ${
                                    plan.highlight 
                                    ? "bg-blue-600 shadow-[0_30px_60px_rgba(37,99,235,0.2)] border-2 border-blue-400" 
                                    : "bg-white/5 border border-white/10 backdrop-blur-xl"
                                }`}
                            >
                                {plan.highlight && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-blue-600 rounded-full text-xs font-black uppercase tracking-widest">
                                        Most Popular
                                    </div>
                                )}

                                <div className="mb-8">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${plan.highlight ? "bg-white/20 text-white" : "bg-blue-500/10 text-blue-400"}`}>
                                        <Icon size={24} />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black">{plan.price}</span>
                                        {plan.price !== "Custom" && <span className={`text-sm ${plan.highlight ? "text-blue-100" : "text-gray-500"}`}>/month</span>}
                                    </div>
                                    <p className={`mt-4 text-sm ${plan.highlight ? "text-blue-100/80" : "text-gray-500"}`}>{plan.desc}</p>
                                </div>

                                <div className="space-y-4 flex-1 mb-10">
                                    {plan.features.map((feat, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.highlight ? "bg-white/20 text-white" : "bg-blue-500/20 text-blue-400"}`}>
                                                <Check size={12} strokeWidth={3} />
                                            </div>
                                            <span className={`text-sm ${plan.highlight ? "text-blue-50" : "text-gray-300"}`}>{feat}</span>
                                        </div>
                                    ))}
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate(plan.name === "Enterprise" ? "/contact" : "/register")}
                                    className={`w-full py-4 rounded-2xl font-black transition-all ${
                                        plan.highlight 
                                        ? "bg-white text-blue-600 hover:bg-blue-50 shadow-xl shadow-black/10" 
                                        : "bg-white/5 border border-white/10 hover:bg-white/10"
                                    }`}
                                >
                                    {plan.cta}
                                </motion.button>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="mt-24 text-center">
                    <p className="text-gray-500 text-sm">All plans include end-to-end encryption and 99.9% uptime. Need more? <button onClick={() => navigate("/contact")} className="text-blue-400 font-bold hover:underline">Contact us</button></p>
                </div>
            </div>
        </div>
    );
};

export default Pricing;
