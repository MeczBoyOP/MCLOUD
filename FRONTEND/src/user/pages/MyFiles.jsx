import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Folder, FolderOpen, FolderPlus, Upload, MoreVertical,
    Copy, Clipboard, Download, EyeOff, Eye, Pin, QrCode,
    Trash2, X, Check, ChevronRight, Home,
    FileText, FileImage, FileSpreadsheet, FileArchive, FileBadge,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFolders, createFolder as apiCreateFolder, deleteFolder as apiDeleteFolder, getFolderBreadcrumb, moveFolder as apiMoveFolder } from "../../features/folders/services/folderAPI";
import { getFiles, uploadFile as apiUploadFile, deleteFile as apiDeleteFile, downloadFileUrl, moveFile as apiMoveFile } from "../../features/files/services/fileAPI";
import { toast } from "sonner";

const FICON = {
    pdf: <FileBadge size={20} className="text-red-400" />,
    excel: <FileSpreadsheet size={20} className="text-green-400" />,
    image: <FileImage size={20} className="text-purple-400" />,
    doc: <FileText size={20} className="text-blue-300" />,
};

/* ── Context Menu ────────────────────────────────────────────────── */
const CtxMenu = ({ item, isFolder, hidden, pinned, pos, onClose, onAction }) => {
    const ref = useRef(null);
    useEffect(() => {
        const h = e => { if (!ref.current?.contains(e.target)) onClose(); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, [onClose]);

    const options = [
        { label: "Copy", icon: Copy, act: "copy" },
        { label: "Paste", icon: Clipboard, act: "paste" },
        { label: isFolder ? "Download as ZIP" : "Download", icon: Download, act: "download" },
        { label: hidden ? "Unhide" : "Hide", icon: hidden ? Eye : EyeOff, act: "hide" },
        { label: pinned ? "Unpin" : "Pin", icon: Pin, act: "pin" },
        { label: "QR Code", icon: QrCode, act: "qr" },
        { label: "Delete", icon: Trash2, act: "delete", danger: true },
    ];

    return (
        <motion.div ref={ref} initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .95 }}
            transition={{ duration: .1 }} style={{ top: pos.y, left: pos.x }}
            className="fixed z-999 min-w-[190px] bg-[#111117] border border-white/10 rounded-xl shadow-2xl py-1 overflow-hidden"
        >
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
                <span className="text-xs text-gray-400 truncate max-w-[140px]">{item.name}</span>
                <button onClick={onClose}><X size={12} className="text-gray-500 hover:text-white" /></button>
            </div>
            {options.map(o => (
                <button key={o.act} onClick={() => { onAction(o.act); onClose(); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition
            ${o.danger ? "text-red-400 hover:bg-red-500/10" : "text-gray-300 hover:bg-white/5 hover:text-white"}`}
                >
                    <o.icon size={13} className={o.danger ? "text-red-400" : "text-blue-400"} />
                    {o.label}
                </button>
            ))}
        </motion.div>
    );
};

/* ── QR Modal ────────────────────────────────────────────────────── */
const QRModal = ({ item, onClose }) => {
    const url = `https://mcloud.app/share/${item.id}`;
    const src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}&bgcolor=111117&color=60a5fa&margin=10`;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ scale: .9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: .9, opacity: 0 }}
                className="relative z-10 bg-[#0f0f13] border border-white/10 rounded-2xl p-6 w-72 shadow-2xl text-center"
            >
                <h2 className="text-sm font-semibold mb-1 truncate">{item.name}</h2>
                <p className="text-xs text-gray-500 mb-4 break-all">{url}</p>
                <div className="flex justify-center mb-4 rounded-xl overflow-hidden bg-[#111117] p-2">
                    <img src={src} alt="QR Code" className="w-44 h-44 rounded" />
                </div>
                <p className="text-xs text-gray-400 mb-4">Scan to open shared link</p>
                <button onClick={onClose} className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm text-white transition">Close</button>
            </motion.div>
        </div>
    );
};

/* ── Add Folder Modal ────────────────────────────────────────────── */
const AddFolderModal = ({ onClose, onCreate }) => {
    const [name, setName] = useState("");
    const ref = useRef(null);
    useEffect(() => ref.current?.focus(), []);
    const submit = () => { if (name.trim()) { onCreate(name.trim()); onClose(); } };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ scale: .9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: .9, opacity: 0 }}
                className="relative z-10 bg-[#0f0f13] border border-white/10 rounded-2xl p-6 w-80 shadow-2xl"
            >
                <h2 className="text-base font-semibold mb-4 flex items-center gap-2"><FolderPlus size={16} className="text-blue-400" />New Folder</h2>
                <input ref={ref} value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()}
                    placeholder="Folder name…"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500/60 transition"
                />
                <div className="flex gap-2 mt-4 justify-end">
                    <button onClick={onClose} className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition">Cancel</button>
                    <button onClick={submit} className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm text-white transition">Create</button>
                </div>
            </motion.div>
        </div>
    );
};

/* ── Delete Modal ────────────────────────────────────────────────── */
const DeleteModal = ({ item, onClose, onConfirm }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ scale: .9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: .9, opacity: 0 }}
            className="relative z-10 bg-[#0f0f13] border border-white/10 rounded-2xl p-6 w-80 shadow-2xl"
        >
            <h2 className="text-base font-semibold mb-2 text-red-400 flex items-center gap-2"><Trash2 size={16} />Delete</h2>
            <p className="text-sm text-gray-400 mb-5">Delete <span className="text-white font-medium">"{item.name}"</span>? This cannot be undone.</p>
            <div className="flex gap-2 justify-end">
                <button onClick={onClose} className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition">Cancel</button>
                <button onClick={() => { onConfirm(); onClose(); }} className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-sm text-white transition">Delete</button>
            </div>
        </motion.div>
    </div>
);

/* ── Upload Toast ────────────────────────────────────────────────── */
const UploadToast = ({ name, onDone }) => {
    const [p, setP] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setP(v => { if (v >= 100) { clearInterval(t); setTimeout(onDone, 600); return 100; } return v + Math.random() * 20; }), 110);
        return () => clearInterval(t);
    }, [onDone]);
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-[#111117] border border-white/10 rounded-xl px-4 py-3 w-64 shadow-2xl"
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white truncate max-w-[170px]">{name}</span>
                {p >= 100 && <Check size={13} className="text-green-400 shrink-0" />}
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min(p, 100)}%` }} />
            </div>
            <p className="text-[10px] text-gray-500 mt-1">{p >= 100 ? "Done" : `${Math.round(Math.min(p, 100))}%`}</p>
        </motion.div>
    );
};

/* ── Main Page ───────────────────────────────────────────────────── */
const MyFiles = () => {
    const [params, setParams] = useSearchParams();
    const fid = params.get("fid") || "root";
    const queryClient = useQueryClient();

    const [hidden, setHidden] = useState(new Set());
    const [pinned, setPinned] = useState(new Set());
    const [clipboard, setClipboard] = useState(null); // {item, isFolder}

    const [ctx, setCtx] = useState(null);  // {item,isFolder,pos}
    const [modal, setModal] = useState(null);  // {type, item}
    const [uploads, setUploads] = useState([]);
    const fileRef = useRef(null);
    const [isDragOverRoot, setIsDragOverRoot] = useState(false);
    const [isDragOverMain, setIsDragOverMain] = useState(false);

    // Queries
    const isRoot = fid === "root";
    const parentIdParam = isRoot ? null : fid;

    const { data: folderData, isLoading: foldersLoading } = useQuery({
        queryKey: ['folders', fid],
        queryFn: () => getFolders({ parentId: parentIdParam })
    });

    const { data: fileData, isLoading: filesLoading } = useQuery({
        queryKey: ['files', fid],
        queryFn: () => getFiles({ folderId: parentIdParam })
    });

    const { data: breadcrumbData } = useQuery({
        queryKey: ['breadcrumb', fid],
        queryFn: () => getFolderBreadcrumb(fid),
        enabled: !isRoot,
    });

    const breadcrumbs = isRoot ? [] : (breadcrumbData?.data?.breadcrumb || []);

    const foldersList = folderData?.data?.folders || [];
    const filesList = fileData?.data?.files || [];

    // Mutations
    const createFolderMutation = useMutation({
        mutationFn: apiCreateFolder,
        onSuccess: () => {
            toast.success("Folder created");
            queryClient.invalidateQueries(['folders', fid]);
        },
        onError: () => toast.error("Failed to create folder")
    });

    const deleteFolderMutation = useMutation({
        mutationFn: apiDeleteFolder,
        onSuccess: () => {
            toast.success("Folder deleted");
            queryClient.invalidateQueries(['folders', fid]);
        },
        onError: () => toast.error("Failed to delete folder")
    });

    const deleteFileMutation = useMutation({
        mutationFn: apiDeleteFile,
        onSuccess: () => {
            toast.success("File deleted");
            queryClient.invalidateQueries(['files', fid]);
        },
        onError: () => toast.error("Failed to delete file")
    });

    const uploadMutation = useMutation({
        mutationFn: apiUploadFile,
        onSuccess: () => {
            toast.success("File uploaded");
            queryClient.invalidateQueries(['files', fid]);
        },
        onError: () => toast.error("Upload failed")
    });

    const moveFolderMutation = useMutation({
        mutationFn: apiMoveFolder,
        onSuccess: () => {
            toast.success("Folder moved");
            queryClient.invalidateQueries(['folders']); // invalidate all to update sidebar
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to move folder")
    });

    const moveFileMutation = useMutation({
        mutationFn: apiMoveFile,
        onSuccess: () => {
            toast.success("File moved");
            queryClient.invalidateQueries(['files']);
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to move file")
    });

    /* navigate */
    const openFolder = id => setParams({ fid: id });

    /* drop handler */
    const handleDropOnFolder = (e, targetFolderId) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const data = JSON.parse(e.dataTransfer.getData("application/json"));
            if (!data || !data.id || !data.type) return;
            // Target folder can be string "null" for root
            if (data.id === targetFolderId) return;

            if (data.type === 'folder') {
                moveFolderMutation.mutate({ id: data.id, targetFolderId });
            } else if (data.type === 'file') {
                moveFileMutation.mutate({ id: data.id, targetFolderId });
            }
        } catch (err) {
            // ignore invalid drops
        }
    };

    /* context menu */
    const openCtx = (e, item, isFolder) => {
        e.stopPropagation();
        const r = e.currentTarget.getBoundingClientRect();
        setCtx({ item, isFolder, pos: { x: r.left, y: r.bottom + 4 } });
    };

    /* context actions */
    const handleAction = async (act) => {
        if (!ctx) return;
        const { item, isFolder } = ctx;
        const id = item._id || item.id;

        if (act === "hide") { setHidden(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }); return; }
        if (act === "pin") { setPinned(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }); return; }
        if (act === "copy") { setClipboard({ item, isFolder }); return; }
        if (act === "paste") { handlePaste(); return; }
        if (act === "qr") { setModal({ type: "qr", item }); return; }
        if (act === "delete") { setModal({ type: "delete", item, isFolder }); return; }
        if (act === "download") {
            if (!isFolder) {
                try {
                    const response = await downloadFileUrl(id);
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', item.originalName || item.name);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                } catch (err) {
                    toast.error("Download failed");
                }
            } else {
                toast.info("Folder download not supported yet");
            }
            return;
        }
    };

    const handlePaste = () => {
        if (!clipboard) return;
        toast.info("Paste not fully implemented via API yet");
    };

    /* add folder */
    const createFolder = (name) => {
        createFolderMutation.mutate({ name, parentId: parentIdParam });
    };

    /* delete */
    const handleDelete = () => {
        if (!modal) return;
        const { item, isFolder } = modal;
        const id = item._id || item.id;
        if (isFolder) {
            deleteFolderMutation.mutate(id);
        } else {
            deleteFileMutation.mutate(id);
        }
    };

    /* upload */
    const handleUpload = e => {
        Array.from(e.target.files || []).forEach(f => {
            const formData = new FormData();
            formData.append("file", f);
            if (!isRoot) formData.append("folderId", fid);

            const uid = `_${Date.now() + Math.random()}`;
            setUploads(p => [...p, { id: uid, name: f.name }]);
            uploadMutation.mutate(formData);
        });
        e.target.value = "";
    };

    /* filter hidden */
    const visibleFolders = foldersList.filter(f => !hidden.has(f._id));
    const visibleFiles = filesList.filter(f => !hidden.has(f._id));
    const pinnedFolders = visibleFolders.filter(f => pinned.has(f._id));
    const normalFolders = visibleFolders.filter(f => !pinned.has(f._id));
    const pinnedFiles = visibleFiles.filter(f => pinned.has(f._id));
    const normalFiles = visibleFiles.filter(f => !pinned.has(f._id));

    const FolderCard = ({ f }) => {
        const [isDragOver, setIsDragOver] = useState(false);
        return (
            <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .9 }}
                whileHover={{ y: -2 }} onClick={() => openFolder(f._id)}
                draggable
                onDragStart={(e) => {
                    e.dataTransfer.setData("application/json", JSON.stringify({ type: 'folder', id: f._id }));
                }}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
                onDrop={(e) => { setIsDragOver(false); handleDropOnFolder(e, f._id); }}
                className={`group relative p-4 rounded-xl bg-white/5 border 
                 transition-all duration-300 cursor-pointer
                 ${isDragOver ? "border-blue-500 shadow-[0_0_22px_rgba(37,99,235,0.4)]" : "border-white/10 hover:border-blue-500/40 hover:shadow-[0_0_22px_rgba(37,99,235,0.18)]"}`}
            >
                {pinned.has(f._id) && <Pin size={10} className="absolute top-2 left-2 text-blue-400 fill-blue-400" />}
                <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                        <Folder size={18} className="text-blue-400" />
                    </div>
                    <button onClick={e => openCtx(e, f, true)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition">
                        <MoreVertical size={14} />
                    </button>
                </div>
                <p className="text-sm font-medium truncate">{f.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(f.createdAt).toLocaleDateString()}</p>
            </motion.div>
        )
    };

    const FileCard = ({ f }) => (
        <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .9 }}
            whileHover={{ y: -2 }}
            draggable
            onDragStart={(e) => {
                e.dataTransfer.setData("application/json", JSON.stringify({ type: 'file', id: f._id }));
            }}
            className="group relative p-4 rounded-xl bg-white/5 border border-white/10
                 hover:border-blue-500/30 hover:shadow-[0_0_18px_rgba(37,99,235,0.12)]
                 transition-all duration-300 cursor-default"
        >
            {pinned.has(f._id) && <Pin size={10} className="absolute top-2 left-2 text-blue-400 fill-blue-400" />}
            <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-white/5">{FICON[f.extension] || <FileText size={20} className="text-gray-300" />}</div>
                <button onClick={e => openCtx(e, f, false)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition">
                    <MoreVertical size={14} />
                </button>
            </div>
            <p className="text-sm font-medium truncate">{f.originalName || f.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{new Date(f.createdAt).toLocaleDateString()} · {(f.size / (1024 * 1024)).toFixed(2)} MB</p>
        </motion.div>
    );

    const Section = ({ label, items, Card }) => items.length > 0 && (
        <section>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">{label}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                <AnimatePresence>{items.map(i => <Card key={i.id || i._id} f={i} />)}</AnimatePresence>
            </div>
        </section>
    );

    return (
        <div
            className={`space-y-6 pb-10 min-h-[50vh] rounded-2xl transition ${isDragOverMain ? "bg-white/2 ring-1 ring-white/10" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOverMain(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragOverMain(false); }}
            onDrop={(e) => { setIsDragOverMain(false); handleDropOnFolder(e, isRoot ? "null" : fid); }}
        >

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-1 flex-wrap">
                    <span
                        className={`flex items-center gap-1 rounded px-1 transition ${isDragOverRoot ? "bg-white/10" : ""}`}
                        onDragOver={e => { e.preventDefault(); setIsDragOverRoot(true); }}
                        onDragLeave={e => { e.preventDefault(); setIsDragOverRoot(false); }}
                        onDrop={e => { setIsDragOverRoot(false); handleDropOnFolder(e, "null"); }}
                    >
                        <button onClick={() => openFolder("root")}
                            className={`text-sm transition ${isRoot ? "text-white font-medium" : "text-gray-400 hover:text-white"}`}
                        >
                            <Home size={14} className="inline -mt-0.5" />
                        </button>
                    </span>
                    {breadcrumbs.map((b, i) => {
                        const isLast = i === breadcrumbs.length - 1;
                        return (
                            <span
                                key={b.id || b._id}
                                className="flex items-center gap-1 rounded px-1 transition hover:bg-white/5"
                                onDragOver={e => { e.preventDefault(); }}
                                onDrop={e => { handleDropOnFolder(e, b.id || b._id); }}
                            >
                                <ChevronRight size={13} className="text-gray-600" />
                                <button onClick={() => openFolder(b.id || b._id)}
                                    className={`text-sm transition ${isLast
                                        ? "text-white font-medium"
                                        : "text-gray-400 hover:text-white"}`}
                                >
                                    {b.name}
                                </button>
                            </span>
                        );
                    })}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setModal({ type: "addFolder" })}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10
                       text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/20 transition">
                        <FolderPlus size={14} className="text-blue-400" /> Add Folder
                    </button>
                    <button onClick={() => fileRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-500
                       text-white font-medium shadow-[0_0_16px_rgba(37,99,235,0.35)] transition">
                        <Upload size={14} /> Upload File
                    </button>
                    <input ref={fileRef} type="file" multiple className="hidden" onChange={handleUpload} />
                </div>
            </div>

            {/* Grids */}
            <Section label={pinned.size ? "📌 Pinned Folders" : ""} items={pinnedFolders} Card={FolderCard} />
            <Section label="Folders" items={normalFolders} Card={FolderCard} />
            <Section label={pinned.size ? "📌 Pinned Files" : ""} items={pinnedFiles} Card={FileCard} />
            <Section label="Files" items={normalFiles} Card={FileCard} />

            {normalFolders.length === 0 && normalFiles.length === 0 && pinnedFolders.length === 0 && pinnedFiles.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-600">
                    <Folder size={40} className="mb-3 opacity-30" />
                    <p className="text-sm">This folder is empty</p>
                </div>
            )}

            {/* Context menu */}
            <AnimatePresence>
                {ctx && (
                    <CtxMenu item={ctx.item} isFolder={ctx.isFolder}
                        hidden={hidden} pinned={pinned}
                        pos={ctx.pos} onClose={() => setCtx(null)}
                        onAction={handleAction}
                    />
                )}
            </AnimatePresence>

            {/* Modals */}
            <AnimatePresence>
                {modal?.type === "addFolder" && <AddFolderModal onClose={() => setModal(null)} onCreate={createFolder} />}
                {modal?.type === "qr" && <QRModal item={modal.item} onClose={() => setModal(null)} />}
                {modal?.type === "delete" && <DeleteModal item={modal.item} onClose={() => setModal(null)} onConfirm={handleDelete} />}
            </AnimatePresence>

            {/* Upload toasts */}
            <AnimatePresence>
                {uploads.map(u => (
                    <UploadToast key={u.id} name={u.name} onDone={() => setUploads(p => p.filter(x => x.id !== u.id))} />
                ))}
            </AnimatePresence>

        </div>
    );
};

export default MyFiles;
