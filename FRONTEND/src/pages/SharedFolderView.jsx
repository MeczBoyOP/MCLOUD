import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSharedFolder } from "../features/folders/services/folderAPI";
import { motion } from "framer-motion";
import {
    Folder, FileText, FileImage, FileSpreadsheet, FileArchive, FileBadge,
    Lock, User, Calendar, HardDrive
} from "lucide-react";

const FICON = {
    pdf: <FileBadge size={18} className="text-red-400" />,
    excel: <FileSpreadsheet size={18} className="text-green-400" />,
    image: <FileImage size={18} className="text-purple-400" />,
    doc: <FileText size={18} className="text-blue-300" />,
};

const fmt = (b) => {
    if (!b || b === 0) return "0 B";
    const k = 1024, s = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return parseFloat((b / Math.pow(k, i)).toFixed(2)) + " " + s[i];
};

const SharedFolderView = () => {
    const { token } = useParams();
    const { data, isLoading, isError } = useQuery({
        queryKey: ["shared-folder", token],
        queryFn: () => getSharedFolder(token),
        retry: false,
    });

    if (isLoading) return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="text-center">
                <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading shared folder...</p>
            </div>
        </div>
    );

    if (isError) return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
            <div className="text-center max-w-sm">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Lock size={28} className="text-red-400" />
                </div>
                <h1 className="text-xl font-bold mb-2">Link Not Found</h1>
                <p className="text-gray-400 text-sm">This shared link is invalid or has expired.</p>
            </div>
        </div>
    );

    const { folder, subFolders, files } = data?.data || {};
    const visibleFolders = (subFolders || []).filter(f => !f.isHidden);
    const hiddenFolders = (subFolders || []).filter(f => f.isHidden);
    const visibleFiles = (files || []).filter(f => !f.isHidden);
    const hiddenFiles = (files || []).filter(f => f.isHidden);

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="border-b border-white/10 px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <h1 className="text-lg font-semibold flex items-center gap-2">
                        M<span className="text-blue-400">Cloud</span>
                        <span className="text-gray-600 mx-2">·</span>
                        <span className="text-gray-300 text-base">Shared Folder</span>
                    </h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
                {/* Folder Info */}
                <div className="bg-gradient-to-br from-[#0f0f18] to-[#0a0a12] border border-white/10 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <Folder size={28} className="text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{folder?.name}</h2>
                            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-400">
                                <div className="flex items-center gap-1.5">
                                    <User size={13} />
                                    Shared by <span className="text-white ml-1">{folder?.sharedBy}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={13} />
                                    {new Date(folder?.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <HardDrive size={13} />
                                    {visibleFolders.length} folder{visibleFolders.length !== 1 ? "s" : ""}, {visibleFiles.length} file{visibleFiles.length !== 1 ? "s" : ""}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visible Sub-Folders */}
                {visibleFolders.length > 0 && (
                    <section>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Folders</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {visibleFolders.map((f, i) => (
                                <Link to={`/share/folder/${f.shareToken}`} key={f._id}>
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition block cursor-pointer">
                                        <div className="p-2 bg-blue-500/10 rounded-lg w-fit mb-3">
                                            <Folder size={16} className="text-blue-400" />
                                        </div>
                                        <p className="text-sm font-medium truncate">{f.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{new Date(f.createdAt).toLocaleDateString()}</p>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Visible Files */}
                {visibleFiles.length > 0 && (
                    <section>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Files</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {visibleFiles.map((f, i) => (
                                <Link to={`/share/file/${f.shareToken}`} key={f._id}>
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition block cursor-pointer">
                                        <div className="p-2 bg-white/5 rounded-lg w-fit mb-3">
                                            {FICON[f.extension] || <FileText size={18} className="text-gray-300" />}
                                        </div>
                                        <p className="text-sm font-medium truncate">{f.originalName}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{fmt(f.size)}</p>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Hidden Items */}
                {(hiddenFolders.length > 0 || hiddenFiles.length > 0) && (
                    <section>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">
                            Protected ({hiddenFolders.length + hiddenFiles.length} item{hiddenFolders.length + hiddenFiles.length !== 1 ? "s" : ""})
                        </p>
                        <div className="bg-white/3 border border-white/8 rounded-xl p-6 text-center">
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <Lock size={20} className="text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-400">
                                {hiddenFolders.length + hiddenFiles.length} item{hiddenFolders.length + hiddenFiles.length !== 1 ? "s are" : " is"} hidden by the owner.
                            </p>
                            <p className="text-xs text-gray-600 mt-1">These require a PIN to access.</p>
                        </div>
                    </section>
                )}

                {visibleFolders.length === 0 && visibleFiles.length === 0 && hiddenFolders.length === 0 && hiddenFiles.length === 0 && (
                    <div className="text-center py-16 text-gray-600">
                        <Folder size={40} className="mx-auto mb-3 opacity-30" />
                        <p>This folder is empty</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SharedFolderView;
