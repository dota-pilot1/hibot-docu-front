"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { JournalCategory } from "../api/journalApi";

interface SortableDateItemProps {
  dateCategory: JournalCategory;
  parentId: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export const SortableDateItem: React.FC<SortableDateItemProps> = ({
  dateCategory,
  parentId,
  isSelected,
  onSelect,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: dateCategory.id,
    data: {
      type: "date",
      date: dateCategory,
      parentId,
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
      className={cn(
        "flex items-center gap-1 px-2 py-1.5 cursor-pointer",
        "hover:bg-zinc-100 dark:hover:bg-zinc-800",
        isSelected && "bg-blue-50 dark:bg-blue-900/20",
        isDragging && "opacity-50",
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
        <GripVertical className="h-3 w-3 text-zinc-400" />
      </div>

      <Calendar className="h-4 w-4 text-zinc-400" onClick={onSelect} />
      <span
        className={cn(
          "flex-1 text-sm truncate",
          isSelected && "text-blue-600 dark:text-blue-400 font-medium",
        )}
        onClick={onSelect}
      >
        {dateCategory.name}
      </span>

      {/* 일지 개수 */}
      {dateCategory.journalCount !== undefined && (
        <span className="text-xs text-zinc-400">
          {dateCategory.journalCount}
        </span>
      )}

      {/* 날짜 삭제 버튼 */}
      <button
        className={cn(
          "p-1 rounded opacity-0 group-hover:opacity-100",
          "hover:bg-zinc-200 dark:hover:bg-zinc-700",
          "transition-opacity text-red-500",
        )}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
};
