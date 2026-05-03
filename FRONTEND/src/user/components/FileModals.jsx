import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCodeLib from "react-qr-code";
const QRCodeComponent = QRCodeLib.default || QRCodeLib;
import {
    FolderPlus, Trash2, X, Pencil, QrCode,
    Download, Share2, Lock, FileText, FileImage,
    FileSpreadsheet, FileBadge, ExternalLink, KeyRound, UserCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generateFolderShareToken } from "../../features/folders/services/folderAPI";
import { generateFileShareToken } from "../../features/files/services/fileAPI";
import { toast } from "sonner";

/* ── Overlay wrapper ─────────────────────────────────────────────── */
const Overlay = ({ onClose, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.15 }} className="relative z-10">
            {children}
        </motion.div>
    </div>
);

/* ── Add Folder Modal ────────────────────────────────────────────── */
export const AddFolderModal = ({ onClose, onCreate }) => {
    const [name, setName] = useState("");
    const ref = useRef(null);
    useEffect(() => ref.current?.focus(), []);
    const submit = () => { if (name.trim()) { onCreate(name.trim()); onClose(); } };
    return (
        <Overlay onClose={onClose}>
            <div className="bg-[#0f0f18] border border-white/10 rounded-2xl p-6 w-80 shadow-2xl">
                <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                    <FolderPlus size={16} className="text-blue-400" /> New Folder
                </h2>
                <input ref={ref} value={name} onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && submit()}
                    placeholder="Folder name…"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500/60 transition" />
                <div className="flex gap-2 mt-4 justify-end">
                    <button onClick={onClose} className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition">Cancel</button>
                    <button onClick={submit} className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm text-white transition">Create</button>
                </div>
            </div>
        </Overlay>
    );
};

/* ── Rename Modal ────────────────────────────────────────────────── */
export const RenameModal = ({ item, onClose, onRename }) => {
    const [name, setName] = useState(item?.originalName || item?.name || "");
    const ref = useRef(null);
    useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);
    const submit = () => { if (name.trim()) { onRename(name.trim()); onClose(); } };
    return (
        <Overlay onClose={onClose}>
            <div className="bg-[#0f0f18] border border-white/10 rounded-2xl p-6 w-80 shadow-2xl">
                <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                    <Pencil size={16} className="text-blue-400" /> Rename
                </h2>
                <input ref={ref} value={name} onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && submit()}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500/60 transition" />
                <div className="flex gap-2 mt-4 justify-end">
                    <button onClick={onClose} className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition">Cancel</button>
                    <button onClick={submit} className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm text-white transition">Rename</button>
                </div>
            </div>
        </Overlay>
    );
};

/* ── Delete Modal ────────────────────────────────────────────────── */
export const DeleteModal = ({ item, onClose, onConfirm }) => (
    <Overlay onClose={onClose}>
        <div className="bg-[#0f0f18] border border-white/10 rounded-2xl p-6 w-80 shadow-2xl">
            <h2 className="text-base font-semibold mb-2 text-red-400 flex items-center gap-2">
                <Trash2 size={16} /> Delete
            </h2>
            <p className="text-sm text-gray-400 mb-5">
                Delete <span className="text-white font-medium">"{item?.originalName || item?.name}"</span>? This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
                <button onClick={onClose} className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition">Cancel</button>
                <button onClick={() => { onConfirm(); onClose(); }} className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-sm text-white transition">Delete</button>
            </div>
        </div>
    </Overlay>
);

/* ── PIN Verify Modal ────────────────────────────────────────────── */
export const PinModal = ({ title = "Enter your PIN", onVerified, onClose, loading }) => {
    const [digits, setDigits] = useState(["", "", "", ""]);
    const refs = [useRef(), useRef(), useRef(), useRef()];

    const handleChange = (i, val) => {
        const v = val.replace(/\D/g, "").slice(-1);
        const next = [...digits]; next[i] = v;
        setDigits(next);
        if (v && i < 3) refs[i + 1].current?.focus();
    };
    const handleKey = (i, e) => {
        if (e.key === "Backspace" && !digits[i] && i > 0) refs[i - 1].current?.focus();
    };
    const submit = () => {
        const pin = digits.join("");
        if (pin.length === 4) onVerified(pin);
        else toast.error("Enter all 4 digits");
    };

    useEffect(() => refs[0].current?.focus(), []);

    return (
        <Overlay onClose={onClose}>
            <div className="bg-[#0f0f18] border border-white/10 rounded-2xl p-6 w-80 shadow-2xl text-center">
                <div className="p-3 bg-blue-500/10 rounded-xl w-fit mx-auto mb-4">
                    <KeyRound size={22} className="text-blue-400" />
                </div>
                <h2 className="text-base font-semibold mb-1">{title}</h2>
                <p className="text-xs text-gray-500 mb-5">Enter your 4-digit privacy PIN</p>
                <div className="flex gap-3 justify-center mb-5">
                    {[0, 1, 2, 3].map(i => (
                        <input key={i} ref={refs[i]} type="password" inputMode="numeric" maxLength={1}
                            value={digits[i]} onChange={e => handleChange(i, e.target.value)}
                            onKeyDown={e => handleKey(i, e)}
                            className="w-12 h-12 text-center text-xl font-bold bg-white/5 border-2 border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none transition" />
                    ))}
                </div>
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-gray-400 transition">Cancel</button>
                    <button onClick={submit} disabled={loading || digits.join("").length !== 4}
                        className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm text-white font-medium transition disabled:opacity-50">
                        {loading ? "Verifying…" : "Confirm"}
                    </button>
                </div>
            </div>
        </Overlay>
    );
};

/* ── No PIN Set Modal ────────────────────────────────────────────── */
export const NoPinSetModal = ({ onClose }) => {
    const navigate = useNavigate();
    return (
        <Overlay onClose={onClose}>
            <div className="bg-[#0f0f18] border border-white/10 rounded-2xl p-6 w-80 shadow-2xl text-center">
                <div className="p-3 bg-amber-500/10 rounded-xl w-fit mx-auto mb-4">
                    <Lock size={22} className="text-amber-400" />
                </div>
                <h2 className="text-base font-semibold mb-2">No PIN Set</h2>
                <p className="text-sm text-gray-400 mb-5">You need to set a 4-digit privacy PIN before you can hide or unhide items.</p>
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 py-2 rounded-xl bg-white/5 text-sm text-gray-400 hover:bg-white/10 transition">Cancel</button>
                    <button onClick={() => { onClose(); navigate("/user/profile"); }}
                        className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-sm text-white font-medium transition flex items-center justify-center gap-1.5">
                        <UserCircle size={14} /> Go to Profile
                    </button>
                </div>
            </div>
        </Overlay>
    );
};

/* ── QR Code Modal ───────────────────────────────────────────────── */
export const QRModal = ({ item, isFolder, onClose }) => {
    const [shareUrl, setShareUrl] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fn = isFolder ? generateFolderShareToken : generateFileShareToken;
        fn(item._id)
            .then(res => setShareUrl(res.data?.shareUrl || ""))
            .catch(() => toast.error("Failed to generate QR"))
            .finally(() => setLoading(false));
    }, [item._id, isFolder]);

    const downloadQR = () => {
        const svg = document.getElementById("mcloud-qr-svg");
        if (!svg) return;
        const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `QR-${item.name || item.originalName}.svg`;
        a.click(); URL.revokeObjectURL(url);
    };

    const copyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied!");
    };

    return (
        <Overlay onClose={onClose}>
            <div className="bg-[#0f0f18] border border-white/10 rounded-2xl p-6 w-80 shadow-2xl text-center">
                <h2 className="text-sm font-semibold mb-1 truncate">{item.name || item.originalName}</h2>
                <p className="text-xs text-gray-500 mb-4 break-all line-clamp-1">{shareUrl || "Generating..."}</p>
                <div className="flex justify-center mb-4 rounded-xl overflow-hidden bg-white p-3">
                    {loading
                        ? <div className="w-44 h-44 flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
                        : shareUrl
                            ? <QRCodeComponent id="mcloud-qr-svg" value={shareUrl} size={176} fgColor="#1e40af" bgColor="#ffffff" />
                            : <p className="text-red-400 text-xs">Failed to generate</p>}
                </div>
                <div className="flex gap-2 mb-3">
                    <button onClick={copyLink} disabled={!shareUrl}
                        className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-300 flex items-center justify-center gap-1.5 transition disabled:opacity-40">
                        <Share2 size={12} /> Copy Link
                    </button>
                    <button onClick={downloadQR} disabled={!shareUrl}
                        className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-300 flex items-center justify-center gap-1.5 transition disabled:opacity-40">
                        <Download size={12} /> Download
                    </button>
                </div>
                <button onClick={onClose} className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm text-white transition">Close</button>
            </div>
        </Overlay>
    );
};

/* ── File Preview Modal ──────────────────────────────────────────── */
export const FilePreviewModal = ({ file, onClose, onDownload }) => {
    const mime = file?.mimetype || "";
    const isImage = mime.startsWith("image/");
    const isVideo = mime.startsWith("video/");
    const isPdf = mime === "application/pdf";
    const isAudio = mime.startsWith("audio/");
    const ext = file?.extension || "";

    const ExtIcon = {
        pdf: <FileBadge size={40} className="text-red-400" />,
        excel: <FileSpreadsheet size={40} className="text-green-400" />,
        image: <FileImage size={40} className="text-purple-400" />,
        doc: <FileText size={40} className="text-blue-300" />,
    }[ext] || <FileText size={40} className="text-gray-400" />;

    const fmt = b => {
        if (!b) return "0 B";
        const k = 1024, s = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(b) / Math.log(k));
        return parseFloat((b / Math.pow(k, i)).toFixed(2)) + " " + s[i];
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="relative z-10 bg-[#0f0f18] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 shrink-0">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{file?.originalName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{fmt(file?.size)} · {file?.mimetype}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                        <button onClick={onDownload}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs text-white transition">
                            <Download size={12} /> Download
                        </button>
                        {file?.url && (
                            <a href={file.url} target="_blank" rel="noreferrer"
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition">
                                <ExternalLink size={14} />
                            </a>
                        )}
                        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition">
                            <X size={16} />
                        </button>
                    </div>
                </div>
                {/* Content */}
                <div className="flex-1 overflow-auto flex items-center justify-center p-4 min-h-[300px]">
                    {isImage && <img src={file?.url} alt={file?.originalName} className="max-w-full max-h-[70vh] object-contain rounded-xl" />}
                    {isVideo && <video src={file?.url} controls className="max-w-full max-h-[70vh] rounded-xl" />}
                    {isAudio && <audio src={file?.url} controls className="w-full" />}
                    {isPdf && <iframe src={file?.url} title={file?.originalName} className="w-full h-[65vh] rounded-xl border-0" />}
                    {!isImage && !isVideo && !isAudio && !isPdf && (
                        <div className="text-center py-10">
                            {ExtIcon}
                            <p className="mt-4 text-sm font-medium">{file?.originalName}</p>
                            <p className="text-xs text-gray-500 mt-1">{fmt(file?.size)}</p>
                            <button onClick={onDownload} className="mt-5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm text-white transition flex items-center gap-2 mx-auto">
                                <Download size={14} /> Download to view
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
