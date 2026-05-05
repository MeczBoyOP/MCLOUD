import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

const socialIcons = [
    FaFacebookF,
    FaInstagram,
    FaLinkedin,
    FaTwitter,
];

const PublicFooter = () => {
    return (
        <footer className="relative border-t border-white/10 mt-16">

            {/* Glow */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.06),transparent_70%)]" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">

                    {/* Logo + Social */}
                    <div>
                        <h3 className="font-semibold text-white mb-3">
                            M<span className="text-blue-400">Cloud</span>
                        </h3>

                        <p className="text-gray-400 text-xs leading-relaxed">
                            A modern file system experience built for speed, structure, and control.
                        </p>

                        {/* Social */}
                        <div className="flex gap-3 mt-4">
                            {socialIcons.map((Icon, i) => (
                                <div
                                    key={i}
                                    className="
                    group relative w-9 h-9 rounded-full overflow-hidden
                    border border-white/10
                    flex items-center justify-center
                    bg-white/5
                    transition-all duration-300
                    hover:border-blue-500/40
                  "
                                >
                                    {/* Fill */}
                                    <div className="
                    absolute inset-0
                    translate-y-full group-hover:translate-y-0
                    bg-blue-500/20
                    transition-transform duration-300
                  " />

                                    <Icon className="relative z-10 w-4 h-4 text-blue-400 group-hover:text-white transition" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-gray-300 mb-3 font-bold">Product</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><Link to="/features" className="hover:text-white transition">Features</Link></li>
                            <li><Link to="/pricing" className="hover:text-white transition">Pricing</Link></li>
                            <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-gray-300 mb-3 font-bold">Company</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><Link to="/" className="hover:text-white transition">About</Link></li>
                            <li><Link to="/contact" className="hover:text-white transition">Careers</Link></li>
                            <li><Link to="/features" className="hover:text-white transition">Status</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-gray-300 mb-3 font-bold">Legal</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><Link to="/" className="hover:text-white transition">Privacy</Link></li>
                            <li><Link to="/" className="hover:text-white transition">Terms</Link></li>
                        </ul>
                    </div>

                </div>

                {/* Bottom */}
                <div className="mt-10 pt-6 border-t border-white/10 text-center sm:text-left text-gray-500 text-xs">
                    © {new Date().getFullYear()} MCloud. All rights reserved.
                </div>

            </div>
        </footer>
    );
};

export default PublicFooter;