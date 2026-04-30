import { NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
    LayoutDashboard, Star, Trash2,
    Folder, FolderOpen, HardDrive,
    ChevronRight, FolderPlus, FilePlus,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFolders, createFolder, moveFolder } from "../../features/folders/services/folderAPI";
import { moveFile } from "../../features/files/services/fileAPI";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

/* ─── Top nav items ─────────────────────────────────────────────── */
const menuItems = [
    { name: "Dashboard", path: "/user/dashboard", icon: LayoutDashboard },
    { name: "Starred", path: "/user/starred", icon: Star },
    { name: "Trash", path: "/user/trash", icon: Trash2 },
];

/* ─── Recursive tree node ───────────────────────────────────────── */
const FolderNode = ({ node, level = 0, onNavigate, activeFid, onDropFolder }) => {
    const [open, setOpen] = useState(false);
    const [adding, setAdding] = useState(false);
    const [name, setName] = useState("");
    const [isDragOver, setIsDragOver] = useState(false);
    const inputRef = useRef(null);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['folders', node._id],
        queryFn: () => getFolders({ parentId: node._id }),
        enabled: open
    });

    const children = data?.data?.folders || [];

    useEffect(() => { if (adding) { setName(""); setTimeout(() => inputRef.current?.focus(), 40); } }, [adding]);

    const createFolderMut = useMutation({
        mutationFn: createFolder,
        onSuccess: () => {
            queryClient.invalidateQueries(['folders', node._id]);
            setAdding(false);
            setName("");
            setOpen(true);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to create folder");
        }
    });

    const commit = () => {
        if (name.trim()) createFolderMut.mutate({ name: name.trim(), parentId: node._id });
        else setAdding(false);
    };

    return (
        <div className="relative select-none"
            draggable
            onDragStart={(e) => {
                e.dataTransfer.setData("application/json", JSON.stringify({ type: 'folder', id: node._id }));
                e.stopPropagation();
            }}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }}
            onDrop={(e) => { setIsDragOver(false); onDropFolder(e, node._id); }}
        >
            {/* Tree guide line */}
            {level > 0 && (
                <span className="absolute top-0 h-full border-l border-white/10"
                    style={{ left: `${level * 14 + 6}px` }} />
            )}

            {/* Row */}
            <div
                className={`group/row flex items-center gap-1 py-1 pr-1 rounded text-sm transition cursor-pointer
                    ${String(node._id) === String(activeFid)
                        ? "bg-blue-500/15 text-blue-400 shadow-[inset_0_0_10px_rgba(37,99,235,0.15)]"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }
                    ${isDragOver ? "ring-1 ring-blue-500 bg-blue-500/20" : ""}
                    `}
                style={{ paddingLeft: `${level * 14 + 8}px` }}
                onClick={() => setOpen(!open)}
            >
                {/* Chevron */}
                <ChevronRight
                    size={12}
                    className={`shrink-0 transition-transform duration-150 ${open ? "rotate-90" : ""}`}
                />

                {/* Folder icon */}
                {open
                    ? <FolderOpen size={13} className="text-blue-400 shrink-0" />
                    : <Folder size={13} className="text-blue-400/80 shrink-0" />
                }

                {/* Name — click navigates to My Files page */}
                <span
                    className="flex-1 min-w-0 truncate text-xs"
                    onClick={e => { e.stopPropagation(); onNavigate?.(node._id); }}
                >{node.name}</span>

                {/* + folder button — appear on row hover */}
                <button
                    title="New subfolder"
                    onClick={e => { e.stopPropagation(); setAdding(true); setOpen(true); }}
                    className="opacity-0 group-hover/row:opacity-100 p-0.5 rounded
                               hover:bg-white/10 text-gray-500 hover:text-white transition shrink-0"
                >
                    <FolderPlus size={11} />
                </button>
            </div>

            {/* Inline add input */}
            <AnimatePresence>
                {adding && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.12 }}
                        className="overflow-hidden"
                        style={{ paddingLeft: `${(level + 1) * 14 + 8}px` }}
                    >
                        <div className="flex items-center gap-1 py-1 pr-1">
                            <FolderPlus size={11} className="text-blue-400 shrink-0" />
                            <input
                                ref={inputRef}
                                value={name}
                                onChange={e => setName(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setAdding(false); }}
                                onBlur={commit}
                                placeholder="Folder name…"
                                className="flex-1 min-w-0 bg-white/5 border border-blue-500/50 rounded
                                           text-xs text-white px-2 py-0.5 outline-none
                                           focus:border-blue-500 placeholder-gray-600 transition"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Children */}
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        {isLoading && <div className="pl-8 py-1 text-xs text-gray-500">Loading...</div>}
                        {children.map(child => (
                            <FolderNode
                                key={child._id}
                                node={child}
                                level={level + 1}
                                onNavigate={onNavigate}
                                activeFid={activeFid}
                                onDropFolder={onDropFolder}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ─── MY FILES section ──────────────────────────────────────────── */
const MyFilesSection = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const activeFid = params.get("fid") || "root";
    const [adding, setAdding] = useState(false); // root-level add
    const [rootName, setRootName] = useState("");
    const [isDragOverRoot, setIsDragOverRoot] = useState(false);
    const rootInputRef = useRef(null);
    const queryClient = useQueryClient();

    const { data } = useQuery({
        queryKey: ['folders', 'root'],
        queryFn: () => getFolders({ parentId: "null" })
    });

    const rootFolders = data?.data?.folders || [];

    useEffect(() => { if (adding) { setRootName(""); setTimeout(() => rootInputRef.current?.focus(), 40); } }, [adding]);

    const createRootFolderMut = useMutation({
        mutationFn: createFolder,
        onSuccess: () => {
            queryClient.invalidateQueries(['folders', 'root']);
            setAdding(false);
            setRootName("");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to create folder");
        }
    });

    const moveFolderMutation = useMutation({
        mutationFn: moveFolder,
        onSuccess: () => {
            toast.success("Folder moved");
            queryClient.invalidateQueries(['folders']); 
            queryClient.invalidateQueries(['files']); 
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to move folder")
    });

    const moveFileMutation = useMutation({
        mutationFn: moveFile,
        onSuccess: () => {
            toast.success("File moved");
            queryClient.invalidateQueries(['folders']); 
            queryClient.invalidateQueries(['files']); 
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to move file")
    });

    const commitRoot = () => {
        if (rootName.trim()) createRootFolderMut.mutate({ name: rootName.trim(), parentId: null });
        else setAdding(false);
    };

    const handleDropOnFolder = (e, targetFolderId) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const parsed = JSON.parse(e.dataTransfer.getData("application/json"));
            if (!parsed || !parsed.id || !parsed.type) return;
            if (parsed.id === targetFolderId) return; 

            if (parsed.type === 'folder') {
                moveFolderMutation.mutate({ id: parsed.id, targetFolderId });
            } else if (parsed.type === 'file') {
                moveFileMutation.mutate({ id: parsed.id, targetFolderId });
            }
        } catch (err) {}
    };

    return (
        <div className="border-t border-white/10 pt-3">
            {/* Section header */}
            <div className="flex items-center justify-between mb-1 group/hdr">
                <p
                    className={`text-[10px] text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white transition px-1 py-0.5 -ml-1 rounded ${isDragOverRoot ? "ring-1 ring-blue-500 bg-blue-500/20 text-white" : ""}`}
                    onClick={() => navigate('/user/files')}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOverRoot(true); }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOverRoot(false); }}
                    onDrop={(e) => { e.stopPropagation(); setIsDragOverRoot(false); handleDropOnFolder(e, "null"); }}
                >
                    My Files
                </p>

                <div className="flex items-center gap-0.5 transition">
                    <button
                        title="New Folder"
                        onClick={() => setAdding(true)}
                        className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white transition"
                    >
                        <FolderPlus size={12} />
                    </button>
                </div>
            </div>

            {/* Root-level inline add */}
            <AnimatePresence>
                {adding && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.12 }}
                        className="overflow-hidden"
                    >
                        <div className="flex items-center gap-1 py-1">
                            <FolderPlus size={11} className="text-blue-400 shrink-0" />
                            <input
                                ref={rootInputRef}
                                value={rootName}
                                onChange={e => setRootName(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") commitRoot(); if (e.key === "Escape") setAdding(false); }}
                                onBlur={commitRoot}
                                placeholder="Folder name…"
                                className="flex-1 min-w-0 bg-white/5 border border-blue-500/50 rounded
                                           text-xs text-white px-2 py-0.5 outline-none
                                           focus:border-blue-500 placeholder-gray-600 transition"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tree */}
            <div className="space-y-0.5">
                {rootFolders.map(node => (
                    <FolderNode
                        key={node._id}
                        node={node}
                        onNavigate={id => navigate(`/user/files?fid=${id}`)}
                        activeFid={activeFid}
                        onDropFolder={handleDropOnFolder}
                    />
                ))}
            </div>
        </div>
    );
};

/* ─── Sidebar shell ─────────────────────────────────────────────── */
const Sidebar = () => {
    const { user } = useAuth();

    // Calculate storage
    const storageUsed = user?.storageUsed || 0;
    const storageLimit = user?.storageLimit || (5 * 1024 * 1024 * 1024); // Default 5GB
    const storagePercent = Math.min((storageUsed / storageLimit) * 100, 100);

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="h-full flex flex-col bg-[#020617] border-r border-white/10">

            {/* Top: Logo + nav */}
            <div className="p-4 space-y-4 shrink-0">
                <h1 className="text-lg font-semibold flex items-center gap-2">
                    M<span className="text-blue-400">Cloud</span>
                </h1>

                <div className="space-y-1">
                    {menuItems.map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={i}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition
                                    ${isActive
                                        ? "bg-blue-500/10 text-blue-400 shadow-[inset_0_0_12px_rgba(37,99,235,0.2)]"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"}`
                                }
                            >
                                <Icon size={16} />
                                {item.name}
                            </NavLink>
                        );
                    })}
                </div>
            </div>

            {/* Scrollable MY FILES tree */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
                <MyFilesSection />
            </div>

            {/* Bottom: Storage bar */}
            <div className="border-t border-white/10 p-4 shrink-0">
                <div className="flex items-center gap-2 mb-2 text-sm text-gray-300">
                    <HardDrive size={16} />
                    Storage
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${storagePercent > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${storagePercent}%` }}
                    />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    {formatBytes(storageUsed)} of {formatBytes(storageLimit)} used
                </p>
            </div>

        </div>
    );
};

export default Sidebar;