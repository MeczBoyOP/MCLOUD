import React from "react";
import { Folder, FileText, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getFolders } from "../../features/folders/services/folderAPI";
import { getFiles } from "../../features/files/services/fileAPI";
import { useAuth } from "../../context/AuthContext";

const UserDashboard = () => {
    const { user } = useAuth();

    const { data: folderData, isLoading: foldersLoading } = useQuery({
        queryKey: ['folders', 'root'],
        queryFn: () => getFolders({ parentId: null })
    });

    const { data: fileData, isLoading: filesLoading } = useQuery({
        queryKey: ['files', 'root'],
        queryFn: () => getFiles({ folderId: null, sort: '-createdAt', limit: 10 })
    });

    const folders = folderData?.data?.folders || [];
    const files = fileData?.data?.files || [];

    return (
        <div className="space-y-8">

            {/* 🧠 Header */}
            <div>
                <h1 className="text-2xl font-semibold">Welcome back, {user?.name}</h1>
                <p className="text-gray-400 text-sm">
                    Here's an overview of your root directory.
                </p>
            </div>

            {/* 📂 Folder Grid */}
            <div>
                <h2 className="text-lg mb-4">Your Folders</h2>
                {foldersLoading ? <p className="text-sm text-gray-500">Loading...</p> : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {folders.length === 0 ? <p className="text-sm text-gray-500 col-span-4">No folders yet</p> : null}
                        {folders.map((folder, i) => (
                            <motion.div
                                key={folder._id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="
                                  group relative p-4 rounded-xl
                                  bg-white/5 border border-white/10
                                  hover:border-blue-500/40
                                  transition-all duration-300
                                  hover:shadow-[0_0_25px_rgba(37,99,235,0.2)]
                                "
                            >
                                <Folder className="text-blue-500 mb-3" />
                                <h3 className="text-sm font-semibold truncate">{folder.name}</h3>
                                <p className="text-xs text-gray-400 mt-1">
                                    {new Date(folder.createdAt).toLocaleDateString()}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* 📄 Files Grid */}
            <div>
                <h2 className="text-lg mb-4">Recent Files</h2>
                {filesLoading ? <p className="text-sm text-gray-500">Loading...</p> : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {files.length === 0 ? <p className="text-sm text-gray-500 col-span-3">No files yet</p> : null}
                        {files.map((file, i) => (
                            <motion.div
                                key={file._id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="
                                  group relative p-4 rounded-xl
                                  bg-white/5 border border-white/10
                                  hover:border-blue-500/40
                                  transition-all duration-300
                                "
                            >
                                <FileText className="text-gray-300 mb-3" />
                                <h3 className="text-sm font-medium truncate">{file.originalName || file.name}</h3>
                                <p className="text-xs text-gray-400 mt-1">
                                    {new Date(file.createdAt).toLocaleDateString()} • {(file.size / (1024*1024)).toFixed(2)} MB
                                </p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* 📊 Recent Activity */}
            <div>
                <h2 className="text-lg mb-4">Recent Activities</h2>
                <div className="border border-white/10 rounded-xl overflow-hidden">
                    <div className="flex justify-between px-4 py-3 text-xs text-gray-400 border-b border-white/10">
                        <span>FILE NAME</span>
                        <span>MODIFIED</span>
                    </div>
                    <div className="divide-y divide-white/10">
                        {files.slice(0, 5).map(f => (
                            <div key={f._id} className="flex justify-between items-center px-4 py-3 text-sm hover:bg-white/5 transition">
                                <span className="truncate max-w-[70%]">{f.originalName || f.name}</span>
                                <span className="text-gray-400 text-xs shrink-0">{new Date(f.updatedAt).toLocaleDateString()}</span>
                            </div>
                        ))}
                        {files.length === 0 && (
                             <div className="px-4 py-3 text-sm text-gray-500 text-center">No recent activity</div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default UserDashboard;