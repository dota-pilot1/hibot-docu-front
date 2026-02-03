"use client";

import {
  ChevronRight,
  Folder,
  FolderOpen,
  Calendar,
  MoreHorizontal,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import type { JournalCategory } from "../api/journalApi";

interface JournalTeamItemProps {
  team: JournalCategory & { children?: JournalCategory[] };
  isExpanded: boolean;
  selectedCategoryId: number | null;
  onToggle: () => void;
  onSelectCategory: (category: JournalCategory) => void;
  onCreateDate: (teamId: number) => void;
  onRenameTeam: (team: JournalCategory) => void;
  onDeleteTeam: (teamId: number) => void;
  onDeleteDate: (dateId: number) => void;
}

export const JournalTeamItem: React.FC<JournalTeamItemProps> = ({
  team,
  isExpanded,
  selectedCategoryId,
  onToggle,
  onSelectCategory,
  onCreateDate,
  onRenameTeam,
  onDeleteTeam,
  onDeleteDate,
}) => {
  const dateCategories = team.children || [];

  return (
    <div>
      {/* 팀 헤더 */}
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-1.5 cursor-pointer",
          "hover:bg-zinc-100 dark:hover:bg-zinc-800",
          "group",
        )}
        onClick={onToggle}
      >
        <ChevronRight
          className={cn(
            "h-4 w-4 text-zinc-400 transition-transform",
            isExpanded && "rotate-90",
          )}
        />
        {isExpanded ? (
          <FolderOpen className="h-4 w-4 text-yellow-500" />
        ) : (
          <Folder className="h-4 w-4 text-yellow-500" />
        )}
        <span className="flex-1 text-sm truncate">{team.name}</span>
        <span className="text-xs text-zinc-400">{dateCategories.length}</span>

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
            <DropdownMenuItem onClick={() => onCreateDate(team.id)}>
              <Plus className="h-4 w-4 mr-2" />새 날짜
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRenameTeam(team)}>
              <Pencil className="h-4 w-4 mr-2" />
              이름 변경
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeleteTeam(team.id)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 날짜 카테고리 목록 */}
      {isExpanded && (
        <div className="ml-4 border-l border-zinc-200 dark:border-zinc-700">
          {dateCategories.length === 0 ? (
            <div className="px-4 py-2 text-xs text-zinc-400">날짜 없음</div>
          ) : (
            dateCategories.map((dateCategory) => {
              const isSelected = selectedCategoryId === dateCategory.id;

              return (
                <div
                  key={dateCategory.id}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1.5 cursor-pointer",
                    "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                    isSelected && "bg-blue-50 dark:bg-blue-900/20",
                    "group",
                  )}
                  onClick={() => onSelectCategory(dateCategory)}
                >
                  <Calendar className="h-4 w-4 text-zinc-400" />
                  <span
                    className={cn(
                      "flex-1 text-sm truncate",
                      isSelected &&
                        "text-blue-600 dark:text-blue-400 font-medium",
                    )}
                  >
                    {dateCategory.name}
                  </span>

                  {/* 날짜 삭제 버튼 */}
                  <button
                    className={cn(
                      "p-1 rounded opacity-0 group-hover:opacity-100",
                      "hover:bg-zinc-200 dark:hover:bg-zinc-700",
                      "transition-opacity text-red-500",
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDate(dateCategory.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
