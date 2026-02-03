"use client";

import { FileText, MoreHorizontal, Trash2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import type { Journal } from "../api/journalApi";

interface JournalItemProps {
  journal: Journal;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export const JournalItem: React.FC<JournalItemProps> = ({
  journal,
  isSelected,
  onSelect,
  onDelete,
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 cursor-pointer",
        "hover:bg-zinc-100 dark:hover:bg-zinc-800",
        "group",
        isSelected && "bg-blue-50 dark:bg-blue-900/20"
      )}
      onClick={onSelect}
    >
      <FileText className="h-4 w-4 text-zinc-400 shrink-0" />
      <span
        className={cn(
          "flex-1 text-sm truncate",
          isSelected && "text-blue-600 dark:text-blue-400 font-medium"
        )}
      >
        {journal.title}
      </span>
      <span className="text-xs text-zinc-400">{formatDate(journal.journalDate)}</span>

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
          <DropdownMenuItem onClick={onDelete} className="text-red-600">
            <Trash2 className="h-4 w-4 mr-2" />
            삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
