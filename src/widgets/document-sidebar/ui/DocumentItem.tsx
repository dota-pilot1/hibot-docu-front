"use client";

import { FileText, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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

export const DocumentItem = ({
  document,
  onRename,
  onDelete,
}: DocumentItemProps) => {
  const panels = useDocumentStore((s) => s.panels);
  const activePanelId = useDocumentStore((s) => s.activePanelId);
  const openTab = useDocumentStore((s) => s.openTab);

  // 활성 패널의 activeTabId 확인
  const activePanel = panels.find((p) => p.id === activePanelId);
  const isActive = activePanel?.activeTabId === document.id;

  const handleClick = () => {
    openTab({ id: document.id, title: document.title });
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 cursor-pointer",
        "hover:bg-zinc-100 dark:hover:bg-zinc-800",
        "group",
        isActive && "bg-blue-50 dark:bg-blue-900/20",
      )}
      onClick={handleClick}
    >
      <FileText className="h-4 w-4 text-zinc-400 shrink-0" />
      <span
        className={cn(
          "flex-1 text-sm truncate",
          isActive && "text-blue-600 dark:text-blue-400 font-medium",
        )}
      >
        {document.title}
      </span>

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
