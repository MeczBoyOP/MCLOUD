import React from "react";
import { Trash2, RotateCcw, X, FileText, Folder } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTrashFolders, restoreFolder, permanentDeleteFolder } from "../../features/folders/services/folderAPI";
import { getTrashFiles, restoreFile, permanentDeleteFile } from "../../features/files/services/fileAPI";
import { toast } from "sonner";

const Trash = () => {
    const queryClient = useQueryClient();

    const { data: folderData, isLoading: foldersLoading } = useQuery({
        queryKey: ['trashFolders'],
        queryFn: getTrashFolders
    });

    const { data: fileData, isLoading: filesLoading } = useQuery({
        queryKey: ['trashFiles'],
        queryFn: getTrashFiles
    });

    const folders = folderData?.data?.folders || [];
    const files = fileData?.data?.files || [];

    const isLoading = foldersLoading || filesLoading;
    const hasItems = folders.length > 0 || files.length > 0;

    // Mutations for Folders
    const restoreFolderMut = useMutation({
        mutationFn: restoreFolder,
        onSuccess: () => {
            toast.success("Folder restored");
            queryClient.invalidateQueries(['trashFolders']);
            queryClient.invalidateQueries(['folders']);
        }
    });

    const deleteFolderMut = useMutation({
        mutationFn: permanentDeleteFolder,
        onSuccess: () => {
            toast.success("Folder permanently deleted");
            queryClient.invalidateQueries(['trashFolders']);
        }
    });

    // Mutations for Files
    const restoreFileMut = useMutation({
        mutationFn: restoreFile,
        onSuccess: () => {
            toast.success("File restored");
            queryClient.invalidateQueries(['trashFiles']);
            queryClient.invalidateQueries(['files']);
        }
    });

    const deleteFileMut = useMutation({
        mutationFn: permanentDeleteFile,
        onSuccess: () => {
            toast.success("File permanently deleted");
            queryClient.invalidateQueries(['trashFiles']);
        }
    });

    const handleRestore = (item, isFolder) => {
        if (isFolder) restoreFolderMut.mutate(item._id);
        else restoreFileMut.mutate(item._id);
    };

    const handleDelete = (item, isFolder) => {
        if (window.confirm(`Are you sure you want to permanently delete "${item.originalName || item.name}"?`)) {
            if (isFolder) deleteFolderMut.mutate(item._id);
            else deleteFileMut.mutate(item._id);
        }
    };

    return (
        <div className="space-y-8 w-full">

            {/* 🧠 Header */}
            <div>
                <h1 className="text-2xl font-semibold flex items-center gap-2">
                    <Trash2 className="text-red-400" size={20} />
                    Trash
                </h1>
                <p className="text-gray-400 text-sm">
                    Items will be permanently deleted after 30 days
                </p>
            </div>

            {/* 📦 Content */}
            {isLoading ? (
                <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div></div>
            ) : !hasItems ? (
                /* 🗑 Empty State */
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                    <Trash2 size={42} className="mb-4 opacity-40" />
                    <p className="text-sm">No items in trash</p>
                </div>
            ) : (
                /* 📋 Table */
                <div className="border border-white/10 rounded-xl overflow-hidden">

                    {/* Header Row */}
                    <div className="hidden md:grid grid-cols-4 px-4 py-3 text-xs text-gray-400 border-b border-white/10">
                        <span>Name</span>
                        <span>Deleted</span>
                        <span>Size</span>
                        <span className="text-right">Actions</span>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-white/10">
                        {/* Folders */}
                        {folders.map((item, i) => (
                            <motion.div
                                key={`folder-${item._id}`}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="
                                  flex flex-col md:grid md:grid-cols-4
                                  gap-2 md:gap-0
                                  px-4 py-4 md:py-3
                                  text-sm items-start md:items-center
                                  hover:bg-white/5 transition
                                "
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <Folder size={16} className="text-blue-400" />
                                    <span className="truncate">{item.name}</span>
                                </div>
                                <span className="text-gray-400 text-xs md:text-sm">
                                    {new Date(item.trashedAt || item.updatedAt).toLocaleDateString()}
                                </span>
                                <span className="text-gray-400 text-xs md:text-sm">-</span>
                                <div className="flex gap-3 md:justify-end">
                                    <button onClick={() => handleRestore(item, true)} className="text-blue-400 hover:text-blue-300 transition" title="Restore">
                                        <RotateCcw size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(item, true)} className="text-red-400 hover:text-red-300 transition" title="Delete Permanently">
                                        <X size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {/* Files */}
                        {files.map((item, i) => (
                            <motion.div
                                key={`file-${item._id}`}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: (folders.length + i) * 0.05 }}
                                className="
                                  flex flex-col md:grid md:grid-cols-4
                                  gap-2 md:gap-0
                                  px-4 py-4 md:py-3
                                  text-sm items-start md:items-center
                                  hover:bg-white/5 transition
                                "
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <FileText size={16} className="text-gray-300" />
                                    <span className="truncate">{item.originalName || item.name}</span>
                                </div>
                                <span className="text-gray-400 text-xs md:text-sm">
                                    {new Date(item.trashedAt || item.updatedAt).toLocaleDateString()}
                                </span>
                                <span className="text-gray-400 text-xs md:text-sm">
                                    {(item.size / (1024*1024)).toFixed(2)} MB
                                </span>
                                <div className="flex gap-3 md:justify-end">
                                    <button onClick={() => handleRestore(item, false)} className="text-blue-400 hover:text-blue-300 transition" title="Restore">
                                        <RotateCcw size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(item, false)} className="text-red-400 hover:text-red-300 transition" title="Delete Permanently">
                                        <X size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </div>
            )}
        </div>
    );
};

export default Trash;