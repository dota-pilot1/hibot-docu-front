"use client";

import {
  FileText,
  Image,
  FileSpreadsheet,
  FileArchive,
  File,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/shared/lib/utils";
import { DocumentInfo } from "@/features/document-management";
import { useDocumentStore } from "../model/useDocumentStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

interface DocumentItemProps {
  document: DocumentInfo;
  onRename: (doc: DocumentInfo) => void;
  onDelete: (docId: number) => void;
}

const getFileIcon = (mimeType: string | null) => {
  if (!mimeType) return <FileText className="h-4 w-4 text-zinc-400 shrink-0" />;

  if (mimeType.startsWith("image/"))
    return <Image className="h-4 w-4 text-green-500 shrink-0" />;
  if (mimeType === "application/pdf")
    return <FileText className="h-4 w-4 text-red-500 shrink-0" />;
  if (
    mimeType.includes("spreadsheet") ||
    mimeType.includes("excel") ||
    mimeType === "text/csv"
  )
    return <FileSpreadsheet className="h-4 w-4 text-emerald-600 shrink-0" />;
  if (
    mimeType.includes("word") ||
    mimeType.includes("document") ||
    mimeType === "application/hwp" ||
    mimeType === "application/x-hwp"
  )
    return <FileText className="h-4 w-4 text-blue-500 shrink-0" />;
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return <FileText className="h-4 w-4 text-orange-500 shrink-0" />;
  if (
    mimeType.includes("zip") ||
    mimeType.includes("rar") ||
    mimeType.includes("archive")
  )
    return <FileArchive className="h-4 w-4 text-yellow-600 shrink-0" />;

  return <File className="h-4 w-4 text-zinc-400 shrink-0" />;
};

const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

export const DocumentItem = ({
  document,
  onRename,
  onDelete,
}: DocumentItemProps) => {
  const panels = useDocumentStore((s) => s.panels);
  const activePanelId = useDocumentStore((s) => s.activePanelId);
  const openTab = useDocumentStore((s) => s.openTab);

  const activePanel = panels.find((p) => p.id === activePanelId);
  const isActive = activePanel?.activeTabId === document.id;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `doc-${document.id}`,
    data: { type: "document", document },
  });

  const handleDoubleClick = () => {
    openTab({ id: document.id, title: document.title });
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex items-center gap-1 pl-6 pr-2 py-1.5 cursor-pointer",
        "hover:bg-zinc-100 dark:hover:bg-zinc-800",
        "group",
        isActive && "bg-blue-50 dark:bg-blue-900/20",
        isDragging && "opacity-40",
      )}
      onDoubleClick={handleDoubleClick}
    >
      {/* 드래그 손잡이 */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "cursor-grab active:cursor-grabbing p-0.5 rounded shrink-0",
          "hover:bg-zinc-200 dark:hover:bg-zinc-700",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-3.5 w-3.5 text-zinc-400" />
      </div>
      {getFileIcon(document.mimeType)}
      <span
        className={cn(
          "flex-1 text-sm truncate",
          isActive && "text-blue-600 dark:text-blue-400 font-medium",
        )}
      >
        {document.originalName || document.title}
      </span>
      {document.fileSize && (
        <span className="text-[10px] text-zinc-400 shrink-0">
          {formatFileSize(document.fileSize)}
        </span>
      )}

      {/* 컨텍스트 메뉴 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "p-1 rounded opacity-0 group-hover:opacity-100",
              "hover:bg-zinc-200 dark:hover:bg-zinc-700",
              "transition-opacity",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4 text-zinc-500" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onRename(document)}>
            <Pencil className="h-4 w-4 mr-2" />
            이름 변경
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(document.id)}
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
