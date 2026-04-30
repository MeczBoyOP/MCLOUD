import React from "react";
import { Star, MoreVertical, FileText, Folder } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getStarredFolders } from "../../features/folders/services/folderAPI";
import { getStarredFiles } from "../../features/files/services/fileAPI";
import { useNavigate } from "react-router-dom";

const Starred = () => {
    const navigate = useNavigate();

    const { data: folderData, isLoading: foldersLoading } = useQuery({
        queryKey: ['starredFolders'],
        queryFn: getStarredFolders
    });

    const { data: fileData, isLoading: filesLoading } = useQuery({
        queryKey: ['starredFiles'],
        queryFn: getStarredFiles
    });

    const folders = folderData?.data?.folders || [];
    const files = fileData?.data?.files || [];

    const isLoading = foldersLoading || filesLoading;
    const hasItems = folders.length > 0 || files.length > 0;

    return (
        <div className="space-y-8">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold flex items-center gap-2">
                    <Star className="text-yellow-400" size={20} />
                    Starred Files
                </h1>
                <p className="text-gray-400 text-sm">
                    Quick access to your important items
                </p>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
            ) : !hasItems ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                    <Star size={42} className="mb-4 opacity-40" />
                    <p className="text-sm">No starred items yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Folders */}
                    {folders.map((folder, i) => (
                        <motion.div
                            key={`folder-${folder._id}`}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => navigate(`/user/files?fid=${folder._id}`)}
                            className="
                              group relative p-4 rounded-xl
                              bg-white/5 border border-white/10
                              hover:border-yellow-400/40
                              hover:shadow-[0_0_20px_rgba(250,204,21,0.2)]
                              transition-all duration-300 cursor-pointer
                            "
                        >
                            <Folder className="text-blue-400 mb-3" />
                            <h3 className="text-sm font-semibold truncate">{folder.name}</h3>
                            <p className="text-xs text-gray-400 mt-1">
                                {new Date(folder.createdAt).toLocaleDateString()}
                            </p>
                            <MoreVertical className="absolute top-3 right-3 w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition" />
                        </motion.div>
                    ))}

                    {/* Files */}
                    {files.map((file, i) => (
                        <motion.div
                            key={`file-${file._id}`}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: (folders.length + i) * 0.05 }}
                            className="
                              group relative p-4 rounded-xl
                              bg-white/5 border border-white/10
                              hover:border-yellow-400/40
                              hover:shadow-[0_0_20px_rgba(250,204,21,0.2)]
                              transition-all duration-300
                            "
                        >
                            <FileText className="text-gray-300 mb-3" />
                            <h3 className="text-sm font-semibold truncate">{file.originalName || file.name}</h3>
                            <p className="text-xs text-gray-400 mt-1">
                                {new Date(file.createdAt).toLocaleDateString()} • {(file.size / (1024*1024)).toFixed(2)} MB
                            </p>
                            <MoreVertical className="absolute top-3 right-3 w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition cursor-pointer" />
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Starred;