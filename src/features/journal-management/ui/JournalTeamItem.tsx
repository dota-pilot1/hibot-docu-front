"use client";

import { useSortable } from "@dnd-kit/sortable";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronRight,
  Folder,
  FolderOpen,
  MoreHorizontal,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import type { JournalCategory } from "../api/journalApi";
import { SortableDateItem } from "./SortableDateItem";

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

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: team.id,
    data: {
      type: "team",
      team,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "opacity-50")}
    >
      {/* 팀 헤더 */}
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-1.5 cursor-pointer",
          "hover:bg-zinc-100 dark:hover:bg-zinc-800",
          "group",
        )}
      >
        {/* 드래그 핸들 */}
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "cursor-grab active:cursor-grabbing p-0.5 rounded",
            "hover:bg-zinc-200 dark:hover:bg-zinc-700",
          )}
        >
          <GripVertical className="h-4 w-4 text-zinc-400" />
        </div>

        <ChevronRight
          className={cn(
            "h-4 w-4 text-zinc-400 transition-transform cursor-pointer",
            isExpanded && "rotate-90",
          )}
          onClick={onToggle}
        />
        {isExpanded ? (
          <FolderOpen
            className="h-4 w-4 text-yellow-500 cursor-pointer"
            onClick={onToggle}
          />
        ) : (
          <Folder
            className="h-4 w-4 text-yellow-500 cursor-pointer"
            onClick={onToggle}
          />
        )}
        <span
          className="flex-1 text-sm truncate cursor-pointer"
          onClick={onToggle}
        >
          {team.name}
        </span>
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
            <SortableContext
              items={dateCategories.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {dateCategories.map((dateCategory) => (
                <SortableDateItem
                  key={dateCategory.id}
                  dateCategory={dateCategory}
                  parentId={team.id}
                  isSelected={selectedCategoryId === dateCategory.id}
                  onSelect={() => onSelectCategory(dateCategory)}
                  onDelete={() => onDeleteDate(dateCategory.id)}
                />
              ))}
            </SortableContext>
          )}
        </div>
      )}
    </div>
  );
};
