import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
    Folder, FileText, FileImage, FileSpreadsheet, FileBadge,
    MoreVertical, FolderPlus, FilePlus, ChevronRight,
    Star, Trash2, Pencil, Copy, ClipboardPaste, QrCode, Search, Share2,
    EyeOff, Eye, Pin, PinOff, Lock, UserCircle, Download
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

// Services
import {
    getFolders, createFolder, renameFolder, moveFolder,
    toggleFolderStar, deleteFolder, getFolderBreadcrumb, toggleFolderHide, toggleFolderPin, copyFolder
} from "../../features/folders/services/folderAPI";
import {
    getFiles, uploadFile, renameFile, moveFile, copyFile,
    toggleFileStar, deleteFile, toggleFileHide, toggleFilePin, downloadFileUrl
} from "../../features/files/services/fileAPI";

// Modals
import {
    AddFolderModal, RenameModal, DeleteModal, QRModal,
    FilePreviewModal, PinModal, NoPinSetModal
} from "../components/FileModals";

/* ── UI Helpers ──────────────────────────────────────────────────── */
const FICON = {
    pdf: <FileBadge size={28} className="text-red-400" />,
    excel: <FileSpreadsheet size={28} className="text-green-400" />,
    image: <FileImage size={28} className="text-purple-400" />,
    doc: <FileText size={28} className="text-blue-300" />,
};

const fmt = (b) => {
    if (!b || b === 0) return "0 B";
    const k = 1024, s = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return parseFloat((b / Math.pow(k, i)).toFixed(2)) + " " + s[i];
};

/* ── Context Menu Component ──────────────────────────────────────── */
const CtxMenu = ({ item, isFolder, close, onAction, hidePinSet, rect }) => {
    const ref = useRef(null);
    useEffect(() => {
        const h = e => { if (!ref.current?.contains(e.target)) close(); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, [close]);

    // Calculate position to keep it in viewport
    const menuWidth = 176; // w-44 = 176px
    const menuHeight = 300; // approx height
    let top = rect?.bottom || 0;
    let left = (rect?.right || 0) - menuWidth;
    
    // Prevent falling off bottom of screen
    if (top + menuHeight > window.innerHeight) {
        top = (rect?.top || 0) - menuHeight;
    }

    return (
        <motion.div ref={ref} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ position: 'fixed', top, left }}
            className="w-44 bg-[#0f0f18] border border-white/10 rounded-xl shadow-2xl py-1 z-50">
            {!isFolder && (
                <button onClick={() => { onAction('preview', item, isFolder); close(); }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2">
                    <Eye size={14} /> View
                </button>
            )}
            <button onClick={() => { onAction('rename', item, isFolder); close(); }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2">
                <Pencil size={14} /> Rename
            </button>
            <button onClick={() => { onAction('copy', item, isFolder); close(); }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2">
                <Copy size={14} /> Copy
            </button>
            <div className="h-px bg-white/10 my-1 mx-2" />
            <button onClick={() => { onAction('star', item, isFolder); close(); }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2">
                <Star size={14} className={item.isStarred ? "fill-amber-400 text-amber-400" : ""} /> {item.isStarred ? 'Unstar' : 'Star'}
            </button>
            <button onClick={() => { onAction('pin', item, isFolder); close(); }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2">
                {item.isPinned ? <PinOff size={14} /> : <Pin size={14} />} {item.isPinned ? 'Unpin' : 'Pin to top'}
            </button>
            <button onClick={() => { onAction('hide', item, isFolder); close(); }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2">
                {item.isHidden ? <Eye size={14} /> : <EyeOff size={14} />} {item.isHidden ? 'Unhide' : 'Hide'}
            </button>
            <div className="h-px bg-white/10 my-1 mx-2" />
            <button onClick={() => { onAction('qr', item, isFolder); close(); }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2">
                <QrCode size={14} /> Share QR
            </button>
            {!isFolder && (
                <button onClick={() => { onAction('download', item, isFolder); close(); }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2">
                    <Download size={14} /> Download
                </button>
            )}
            <div className="h-px bg-white/10 my-1 mx-2" />
            <button onClick={() => { onAction('delete', item, isFolder); close(); }} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2">
                <Trash2 size={14} /> Delete
            </button>
        </motion.div>
    );
};

/* ── Main Component ──────────────────────────────────────────────── */
const MyFiles = () => {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const folderId = searchParams.get("folderId") || searchParams.get("fid") || null;
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);

    // Context Menu State
    const [menuOpen, setMenuOpen] = useState(null); // { id, isFolder, item }

    // Modal States
    const [modal, setModal] = useState({ type: null, item: null, isFolder: false });
    const [pinUnlockTarget, setPinUnlockTarget] = useState(null); // The action waiting for PIN

    // Clipboard
    const [clipboard, setClipboard] = useState(null); // { type: 'copy', item: {id, isFolder} }

    // Data fetching
    const { data: bData } = useQuery({
        queryKey: ['breadcrumb', folderId],
        queryFn: () => folderId ? getFolderBreadcrumb(folderId) : null,
        enabled: !!folderId
    });
    const breadcrumb = bData?.data?.breadcrumb || [];

    const { data: folderData, isLoading: fLoad } = useQuery({
        queryKey: ['folders', folderId],
        queryFn: () => getFolders({ parentId: folderId })
    });

    const { data: fileData, isLoading: fileLoad } = useQuery({
        queryKey: ['files', folderId],
        queryFn: () => getFiles({ folderId: folderId || "null" })
    });

    const isLoading = fLoad || fileLoad;
    let folders = folderData?.data?.folders || [];
    let files = fileData?.data?.files || [];

    // Sort: Pinned first
    folders = [...folders].sort((a, b) => (b.isPinned === a.isPinned ? 0 : b.isPinned ? 1 : -1));
    files = [...files].sort((a, b) => (b.isPinned === a.isPinned ? 0 : b.isPinned ? 1 : -1));

    /* ── Action Handlers ───────────────────────────────────────────── */
    const handleAction = async (action, item, isFolder) => {
        // PIN check for hiding/unhiding
        if (action === "hide") {
            if (!user?.hidePinSet) { setModal({ type: "no-pin" }); return; }
            setPinUnlockTarget({ action, item, isFolder });
            setModal({ type: "pin-verify" });
            return;
        }

        switch (action) {
            case "rename":
                setModal({ type: "rename", item, isFolder });
                break;
            case "delete":
                setModal({ type: "delete", item, isFolder });
                break;
            case "qr":
                setModal({ type: "qr", item, isFolder });
                break;
            case "preview":
                setModal({ type: "preview", item, isFolder: false });
                break;
            case "copy":
                setClipboard({ type: 'copy', item: { ...item, isFolder } });
                toast.success(`Copied "${item.name || item.originalName}". Go to a folder and Paste.`);
                break;
            case "star":
                const starFn = isFolder ? toggleFolderStar : toggleFileStar;
                toast.promise(starFn(item._id), {
                    loading: "Updating...",
                    success: () => {
                        queryClient.invalidateQueries([isFolder ? 'folders' : 'files', folderId]);
                        return "Updated";
                    },
                    error: "Failed to update star"
                });
                break;
            case "pin":
                const pinFn = isFolder ? toggleFolderPin : toggleFilePin;
                toast.promise(pinFn(item._id), {
                    loading: "Updating pin...",
                    success: () => {
                        queryClient.invalidateQueries([isFolder ? 'folders' : 'files', folderId]);
                        return item.isPinned ? "Unpinned" : "Pinned to top";
                    },
                    error: "Failed to update pin"
                });
                break;
            case "download":
                if (!isFolder) {
                    downloadFileUrl(item._id).then(res => {
                        const url = window.URL.createObjectURL(new Blob([res.data]));
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = item.originalName;
                        a.click();
                        window.URL.revokeObjectURL(url);
                    }).catch(() => toast.error("Download failed"));
                }
                break;
            default: break;
        }
    };

    const handlePinVerified = async (pin) => {
        try {
            // Very simple verify via API
            const { verifyHidePin } = await import("../../features/auth/services/profileAPI");
            await verifyHidePin(pin);

            // If verified, proceed with action
            if (pinUnlockTarget) {
                const { action, item, isFolder } = pinUnlockTarget;
                if (action === "hide") {
                    const hideFn = isFolder ? toggleFolderHide : toggleFileHide;
                    await hideFn(item._id);
                    queryClient.invalidateQueries([isFolder ? 'folders' : 'files', folderId]);
                    toast.success(item.isHidden ? "Item unhidden" : "Item hidden securely");
                }
                // Could handle access to hidden folder here if we wanted
            }
            setModal({ type: null });
            setPinUnlockTarget(null);
        } catch (e) {
            toast.error("Incorrect PIN");
        }
    };

    const handlePaste = async () => {
        if (!clipboard) return;
        const { item, isFolder } = clipboard.item;
        const targetId = folderId || "null";

        const pasteFn = clipboard.item.isFolder ? copyFolder : copyFile;

        toast.promise(pasteFn({ id: clipboard.item._id, targetFolderId: targetId }), {
            loading: clipboard.item.isFolder ? "Copying folder and contents..." : "Copying file...",
            success: () => {
                queryClient.invalidateQueries(['folders', folderId]);
                queryClient.invalidateQueries(['files', folderId]);
                setClipboard(null); // Clear after paste
                refreshUser(); // Update storage
                return "Pasted successfully";
            },
            error: "Failed to paste"
        });
    };

    const uploadMut = useMutation({
        mutationFn: uploadFile,
        onSuccess: () => {
            queryClient.invalidateQueries(['files', folderId]);
            toast.success("File uploaded");
            refreshUser();
        },
        onError: () => toast.error("Upload failed")
    });

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        if (folderId) formData.append("folderId", folderId);
        toast.promise(uploadMut.mutateAsync(formData), {
            loading: "Uploading...",
            success: "Uploaded",
            error: "Failed to upload"
        });
        e.target.value = null; // reset
    };

    const handleItemClick = (item, isFolder) => {
        if (item.isHidden) {
            toast.error("This item is hidden. Unhide it to access.");
            return;
        }
        if (isFolder) navigate(`/user/files?folderId=${item._id}`);
        else setModal({ type: "preview", item, isFolder: false });
    };

    return (
        <div className="h-full flex flex-col space-y-6">

            {/* Header / Breadcrumb / Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center text-xl font-semibold gap-2 overflow-x-auto whitespace-nowrap pb-1">
                    <button onClick={() => navigate("/user/files")} className="hover:text-blue-400 transition text-gray-300">
                        My Files
                    </button>
                    {breadcrumb.map(b => (
                        <React.Fragment key={b._id}>
                            <ChevronRight size={18} className="text-gray-500" />
                            <button onClick={() => navigate(`/user/files?folderId=${b._id}`)} className="hover:text-blue-400 transition text-gray-300">
                                {b.name}
                            </button>
                        </React.Fragment>
                    ))}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {clipboard && (
                        <button onClick={handlePaste} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-sm font-medium transition">
                            <ClipboardPaste size={16} /> Paste
                        </button>
                    )}
                    <button onClick={() => setModal({ type: "add-folder" })} className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition">
                        <FolderPlus size={16} /> New Folder
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium transition">
                        <FilePlus size={16} /> Upload
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" />
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 bg-black/20 border border-white/5 rounded-2xl p-6 overflow-y-auto">
                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />)}
                    </div>
                ) : (
                    <>
                        {folders.length === 0 && files.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                <Folder size={64} className="mb-4 opacity-20" />
                                <p>This folder is empty</p>
                            </div>
                        )}

                        {folders.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-4">Folders</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {folders.map(f => (
                                        <div key={f._id} className="relative group">
                                            <div onClick={() => handleItemClick(f, true)} className={`cursor-pointer h-full p-4 rounded-xl border bg-gradient-to-b from-white/5 to-transparent transition-all duration-300 hover:shadow-lg ${f.isHidden ? 'opacity-50 border-white/5 border-dashed' : 'border-white/10 hover:border-blue-500/40'}`}>
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="p-2.5 bg-blue-500/10 rounded-lg">
                                                        {f.isHidden ? <Lock size={20} className="text-gray-500" /> : <Folder size={20} className="text-blue-400" />}
                                                    </div>
                                                </div>
                                                <h4 className="text-sm font-semibold text-white truncate pr-6">{f.name}</h4>
                                                <p className="text-xs text-gray-500 mt-1">{new Date(f.createdAt).toLocaleDateString()}</p>
                                                {f.isPinned && <Pin size={12} className="absolute bottom-4 right-4 text-amber-400" />}
                                            </div>
                                            <button onClick={(e) => {
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                setMenuOpen({ id: f._id, isFolder: true, item: f, rect });
                                            }}
                                                className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition group-hover:opacity-100 opacity-60">
                                                <MoreVertical size={16} />
                                            </button>
                                            {menuOpen?.id === f._id && <CtxMenu item={f} isFolder close={() => setMenuOpen(null)} onAction={handleAction} hidePinSet={user?.hidePinSet} rect={menuOpen.rect} />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {files.length > 0 && (
                            <div>
                                <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-4">Files</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {files.map(f => (
                                        <div key={f._id} className="relative group">
                                            <div onClick={() => handleItemClick(f, false)} className={`cursor-pointer h-full p-4 rounded-xl border bg-gradient-to-b from-white/5 to-transparent transition-all duration-300 hover:shadow-lg ${f.isHidden ? 'opacity-50 border-white/5 border-dashed' : 'border-white/10 hover:border-blue-500/40'}`}>
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="p-2 bg-white/5 rounded-lg">
                                                        {f.isHidden ? <Lock size={28} className="text-gray-500" /> : FICON[f.extension] || <FileText size={28} className="text-gray-300" />}
                                                    </div>
                                                </div>
                                                <h4 className="text-sm font-medium text-white truncate pr-6">{f.originalName}</h4>
                                                <p className="text-xs text-gray-500 mt-1">{fmt(f.size)}</p>
                                                {f.isPinned && <Pin size={12} className="absolute bottom-4 right-4 text-amber-400" />}
                                            </div>
                                            <button onClick={(e) => {
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                setMenuOpen({ id: f._id, isFolder: false, item: f, rect });
                                            }}
                                                className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition group-hover:opacity-100 opacity-60">
                                                <MoreVertical size={16} />
                                            </button>
                                            {menuOpen?.id === f._id && <CtxMenu item={f} isFolder={false} close={() => setMenuOpen(null)} onAction={handleAction} hidePinSet={user?.hidePinSet} rect={menuOpen.rect} />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modals */}
            <AnimatePresence>
                {modal.type === "add-folder" && (
                    <AddFolderModal onClose={() => setModal({ type: null })}
                        onCreate={(name) => {
                            toast.promise(createFolder({ name, parentId: folderId }), {
                                loading: "Creating...", success: () => { queryClient.invalidateQueries(['folders', folderId]); return "Created"; }, error: "Failed"
                            });
                        }} />
                )}
                {modal.type === "rename" && (
                    <RenameModal item={modal.item} onClose={() => setModal({ type: null })}
                        onRename={(name) => {
                            const fn = modal.isFolder ? renameFolder : renameFile;
                            toast.promise(fn({ id: modal.item._id, name }), {
                                loading: "Renaming...", success: () => { queryClient.invalidateQueries([modal.isFolder ? 'folders' : 'files', folderId]); return "Renamed"; }, error: "Failed"
                            });
                        }} />
                )}
                {modal.type === "delete" && (
                    <DeleteModal item={modal.item} onClose={() => setModal({ type: null })}
                        onConfirm={() => {
                            const fn = modal.isFolder ? deleteFolder : deleteFile;
                            toast.promise(fn(modal.item._id), {
                                loading: "Deleting...", success: () => {
                                    queryClient.invalidateQueries([modal.isFolder ? 'folders' : 'files', folderId]);
                                    refreshUser();
                                    return "Moved to trash";
                                }, error: "Failed"
                            });
                        }} />
                )}
                {modal.type === "qr" && <QRModal item={modal.item} isFolder={modal.isFolder} onClose={() => setModal({ type: null })} />}
                {modal.type === "preview" && (
                    <FilePreviewModal file={modal.item} onClose={() => setModal({ type: null })}
                        onDownload={() => {
                            downloadFileUrl(modal.item._id).then(res => {
                                const url = window.URL.createObjectURL(new Blob([res.data]));
                                const a = document.createElement('a');
                                a.href = url; a.download = modal.item.originalName; a.click();
                                window.URL.revokeObjectURL(url);
                            }).catch(() => toast.error("Download failed"));
                        }} />
                )}
                {modal.type === "no-pin" && <NoPinSetModal onClose={() => setModal({ type: null })} />}
                {modal.type === "pin-verify" && <PinModal onClose={() => setModal({ type: null })} onVerified={handlePinVerified} />}
            </AnimatePresence>
        </div>
    );
};

export default MyFiles;
