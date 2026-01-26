"use client";

import { useState } from "react";
import {
  FileText,
  File,
  Table,
  Image,
  Film,
  Music,
  Paperclip,
  Trash2,
  Pencil,
  Download,
} from "lucide-react";

export type FileType =
  | "PDF"
  | "DOCX"
  | "XLSX"
  | "TXT"
  | "IMAGE"
  | "VIDEO"
  | "AUDIO"
  | "OTHER";

export interface FileItem {
  id: number;
  originalName: string;
  fileSize: number;
  fileType: FileType;
  [key: string]: unknown;
}

interface CommonFileGridProps<T extends FileItem = FileItem> {
  files: T[];
  onDownload?: (file: T) => void;
  onDelete?: (fileId: number) => void;
  onRename?: (fileId: number, newName: string) => void;
  className?: string;
  emptyMessage?: string;
}

const FILE_TYPE_CONFIG: Record<
  FileType,
  { icon: typeof File; color: string }
> = {
  PDF: { icon: FileText, color: "text-red-500" },
  DOCX: { icon: File, color: "text-blue-500" },
  XLSX: { icon: Table, color: "text-green-500" },
  TXT: { icon: File, color: "text-gray-500" },
  IMAGE: { icon: Image, color: "text-purple-500" },
  VIDEO: { icon: Film, color: "text-orange-500" },
  AUDIO: { icon: Music, color: "text-pink-500" },
  OTHER: { icon: Paperclip, color: "text-gray-400" },
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default function CommonFileGrid<T extends FileItem = FileItem>({
  files,
  onDownload,
  onDelete,
  onRename,
  className = "",
  emptyMessage,
}: CommonFileGridProps<T>) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const handleDoubleClick = (file: T) => {
    if (onDownload) {
      onDownload(file);
    }
  };

  const handleRenameStart = (file: FileItem) => {
    setEditingId(file.id);
    setEditName(file.originalName);
  };

  const handleRenameSubmit = (fileId: number) => {
    if (editName.trim() && onRename) {
      onRename(fileId, editName.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, fileId: number) => {
    if (e.key === "Enter") {
      handleRenameSubmit(fileId);
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  if (files.length === 0) {
    if (emptyMessage) {
      return (
        <div className={`text-center py-8 text-gray-400 text-sm ${className}`}>
          {emptyMessage}
        </div>
      );
    }
    return null;
  }

  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 ${className}`}
    >
      {files.map((file) => {
        const config =
          FILE_TYPE_CONFIG[file.fileType] || FILE_TYPE_CONFIG.OTHER;
        const Icon = config.icon;

        return (
          <div
            key={file.id}
            className="group relative bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
            onDoubleClick={() => handleDoubleClick(file)}
          >
            <div className="flex flex-col items-center">
              <Icon className={`w-10 h-10 ${config.color} mb-2`} />

              {editingId === file.id ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => handleRenameSubmit(file.id)}
                  onKeyDown={(e) => handleKeyDown(e, file.id)}
                  className="w-full text-xs text-center border border-blue-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
              ) : (
                <span
                  className="text-xs text-gray-700 text-center truncate w-full"
                  title={file.originalName}
                >
                  {file.originalName}
                </span>
              )}

              <span className="text-[10px] text-gray-400 mt-1">
                {formatFileSize(file.fileSize)}
              </span>
            </div>

            <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
              {onDownload && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(file);
                  }}
                  className="p-1 bg-white rounded shadow hover:bg-gray-100"
                  title="다운로드"
                >
                  <Download className="w-3.5 h-3.5 text-gray-600" />
                </button>
              )}
              {onRename && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRenameStart(file);
                  }}
                  className="p-1 bg-white rounded shadow hover:bg-gray-100"
                  title="이름 변경"
                >
                  <Pencil className="w-3.5 h-3.5 text-gray-600" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(file.id);
                  }}
                  className="p-1 bg-white rounded shadow hover:bg-red-100"
                  title="삭제"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
