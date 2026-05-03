import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSharedFile } from "../features/files/services/fileAPI";
import { motion } from "framer-motion";
import {
    FileText, FileImage, FileSpreadsheet, FileBadge,
    Lock, User, Calendar, HardDrive, Download, ExternalLink, ChevronLeft
} from "lucide-react";

const FICON = {
    pdf: <FileBadge size={40} className="text-red-400" />,
    excel: <FileSpreadsheet size={40} className="text-green-400" />,
    image: <FileImage size={40} className="text-purple-400" />,
    doc: <FileText size={40} className="text-blue-300" />,
};

const fmt = (b) => {
    if (!b || b === 0) return "0 B";
    const k = 1024, s = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return parseFloat((b / Math.pow(k, i)).toFixed(2)) + " " + s[i];
};

const SharedFileView = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { data, isLoading, isError } = useQuery({
        queryKey: ["shared-file", token],
        queryFn: () => getSharedFile(token),
        retry: false,
    });

    if (isLoading) return (
        <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
            <div className="text-center">
                <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading shared file...</p>
            </div>
        </div>
    );

    if (isError) return (
        <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-6">
            <div className="text-center max-w-sm">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Lock size={28} className="text-red-400" />
                </div>
                <h1 className="text-xl font-bold mb-2">Link Not Found</h1>
                <p className="text-gray-400 text-sm">This shared link is invalid or has expired.</p>
            </div>
        </div>
    );

    const file = data?.data?.file;
    if (!file) return null;

    const mime = file?.mimetype || "";
    const isImage = mime.startsWith("image/");
    const isVideo = mime.startsWith("video/");
    const isPdf = mime === "application/pdf";
    const isAudio = mime.startsWith("audio/");
    const ext = file?.extension || "";

    const ExtIcon = FICON[ext] || <FileText size={40} className="text-gray-400" />;

    const downloadDirectly = () => {
        if (!file?.url) return;
        const a = document.createElement('a');
        a.href = file.url;
        a.download = file.originalName;
        a.click();
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col p-6 sm:p-10">
            {/* Header */}
            <header className="max-w-4xl w-full mx-auto mb-6">
                <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1 text-sm text-gray-400 hover:text-white transition w-fit">
                    <ChevronLeft size={16} /> Back
                </button>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold mb-2 break-all">{file.originalName}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 font-medium">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                            <User size={12} className="text-blue-400" />
                            Shared by {file.sharedBy || "Unknown User"}
                        </span>
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                            <Calendar size={12} className="text-green-400" />
                            {new Date(file.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                            <HardDrive size={12} className="text-amber-400" />
                            {fmt(file.size)}
                        </span>
                    </div>
                </div>
                <button onClick={downloadDirectly} className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold transition">
                    <Download size={16} /> Download
                </button>
            </div>
            </header>

            {/* Main Content Preview */}
            <main className="max-w-4xl w-full mx-auto flex-1 bg-[#0f0f18] border border-white/10 rounded-3xl p-6 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10 shrink-0">
                    <h2 className="text-sm font-semibold text-gray-300">File Preview</h2>
                    {file.url && (
                        <a href={file.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition">
                            Open in new tab <ExternalLink size={12} />
                        </a>
                    )}
                </div>

                <div className="flex-1 overflow-auto flex items-center justify-center min-h-[300px]">
                    {isImage && <img src={file?.url} alt={file?.originalName} className="max-w-full max-h-[60vh] object-contain rounded-xl" />}
                    {isVideo && <video src={file?.url} controls className="max-w-full max-h-[60vh] rounded-xl" />}
                    {isAudio && <audio src={file?.url} controls className="w-full max-w-md" />}
                    {isPdf && <iframe src={file?.url} title={file?.originalName} className="w-full h-[60vh] rounded-xl border-0" />}
                    
                    {!isImage && !isVideo && !isAudio && !isPdf && (
                        <div className="text-center py-16">
                            <div className="mx-auto w-fit mb-6 p-4 bg-white/5 rounded-2xl shadow-inner border border-white/5">
                                {ExtIcon}
                            </div>
                            <p className="text-base font-medium mb-2">{file?.originalName}</p>
                            <p className="text-sm text-gray-500 mb-6">{fmt(file?.size)} • {file?.mimetype || "Unknown type"}</p>
                            <button onClick={downloadDirectly} className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-medium transition flex items-center gap-2 mx-auto">
                                <Download size={16} /> Download File
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default SharedFileView;
