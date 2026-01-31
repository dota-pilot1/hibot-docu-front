"use client";

import { useState } from "react";
import { ChevronRight, Folder, FolderOpen, MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { DocumentFolder, DocumentInfo } from "@/features/document-management";
import { useDocumentStore } from "../model/useDocumentStore";
import { DocumentItem } from "./DocumentItem";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

interface DocumentFolderItemProps {
  folder: DocumentFolder;
  onCreateDocument: (folderId: number) => void;
  onRenameFolder: (folder: DocumentFolder) => void;
  onDeleteFolder: (folderId: number) => void;
  onRenameDocument: (doc: DocumentInfo) => void;
  onDeleteDocument: (docId: number) => void;
}

export const DocumentFolderItem = ({
  folder,
  onCreateDocument,
  onRenameFolder,
  onDeleteFolder,
  onRenameDocument,
  onDeleteDocument,
}: DocumentFolderItemProps) => {
  const expandedFolders = useDocumentStore((s) => s.expandedFolders);
  const toggleFolder = useDocumentStore((s) => s.toggleFolder);
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = expandedFolders.has(folder.id);

  return (
    <div>
      {/* 폴더 헤더 */}
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer",
          "hover:bg-zinc-100 dark:hover:bg-zinc-800",
          "group"
        )}
        onClick={() => toggleFolder(folder.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <ChevronRight
          className={cn(
            "h-4 w-4 text-zinc-400 transition-transform",
            isExpanded && "rotate-90"
          )}
        />
        {isExpanded ? (
          <FolderOpen className="h-4 w-4 text-yellow-500" />
        ) : (
          <Folder className="h-4 w-4 text-yellow-500" />
        )}
        <span className="flex-1 text-sm truncate">{folder.name}</span>
        <span className="text-xs text-zinc-400">{folder.documents.length}</span>

        {/* 컨텍스트 메뉴 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "p-1 rounded opacity-0 group-hover:opacity-100",
                "hover:bg-zinc-200 dark:hover:bg-zinc-700",
                "transition-opacity"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4 text-zinc-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onCreateDocument(folder.id)}>
              <Plus className="h-4 w-4 mr-2" />
              새 문서
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRenameFolder(folder)}>
              <Pencil className="h-4 w-4 mr-2" />
              이름 변경
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeleteFolder(folder.id)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 문서 목록 */}
      {isExpanded && (
        <div className="ml-4 border-l border-zinc-200 dark:border-zinc-700">
          {folder.documents.map((doc) => (
            <DocumentItem
              key={doc.id}
              document={doc}
              onRename={onRenameDocument}
              onDelete={onDeleteDocument}
            />
          ))}
          {folder.documents.length === 0 && (
            <div className="px-4 py-2 text-xs text-zinc-400">
              문서 없음
            </div>
          )}
        </div>
      )}
    </div>
  );
};
