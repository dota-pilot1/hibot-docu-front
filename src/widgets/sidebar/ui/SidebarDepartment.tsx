"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  MoreHorizontal,
  FolderPlus,
  Trash2,
  GripVertical,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useUserStore } from "@/entities/user/model/store";
import { useDeleteDepartment } from "@/features/organization/model/useOrganization";
import type { Department } from "@/features/organization/api/organizationApi";

interface SidebarDepartmentProps {
  department: Department;
  collapsed?: boolean;
  children?: React.ReactNode;
  onAddSubDepartment?: (parent: Department) => void;
  isDragDisabled?: boolean;
}

export const SidebarDepartment = ({
  department,
  collapsed,
  children,
  onAddSubDepartment,
  isDragDisabled,
}: SidebarDepartmentProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = useUserStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";
  const deleteDepartment = useDeleteDepartment();

  // Droppable for user drop
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `department-${department.id}`,
    data: {
      type: "department",
      department,
    },
  });

  // Sortable for department reorder
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `dept-${department.id}`,
    data: {
      type: "dept-sortable",
      department,
    },
    disabled: isDragDisabled || collapsed,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasChildren =
    department.children.length > 0 || department.users.length > 0;
  const userCount =
    department.users.length +
    department.children.reduce((acc, child) => acc + child.users.length, 0);

  const handleDelete = async () => {
    if (confirm(`"${department.name}" 부서를 삭제하시겠습니까?`)) {
      try {
        await deleteDepartment.mutateAsync(department.id);
      } catch (error) {
        console.error("Failed to delete department:", error);
      }
    }
  };

  if (collapsed) {
    return (
      <div className="w-full py-1">
        <div
          className="flex items-center justify-center h-8 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
          title={department.name}
        >
          <Folder className="h-4 w-4 text-amber-500" />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={(node) => {
        setDroppableRef(node);
        setSortableRef(node);
      }}
      style={style}
      className={cn("w-full group/dept", isDragging && "opacity-50 z-50")}
    >
      <div
        className={cn(
          "flex items-center gap-1 py-1.5 px-2 cursor-pointer rounded-md",
          "hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
          isOver && "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500",
        )}
        style={{
          paddingLeft:
            department.depth > 0 ? `${8 + department.depth * 12}px` : undefined,
        }}
      >
        {/* 드래그 핸들 */}
        {isAdmin && !isDragDisabled && (
          <div
            {...attributes}
            {...listeners}
            className={cn(
              "cursor-grab active:cursor-grabbing p-0.5 -ml-1 rounded",
              "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300",
              "hover:bg-zinc-200 dark:hover:bg-zinc-700",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </div>
        )}

        <div
          className="flex items-center gap-1 flex-1 min-w-0"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            )
          ) : (
            <span className="w-3.5" />
          )}
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 text-amber-500 shrink-0" />
          ) : (
            <Folder className="h-4 w-4 text-amber-500 shrink-0" />
          )}
          <span className="text-sm font-medium truncate flex-1">
            {department.name}
          </span>
        </div>

        {userCount > 0 && (
          <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 rounded shrink-0">
            {userCount}
          </span>
        )}

        {isAdmin && (
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-6 w-6 transition-opacity shrink-0",
                  isMenuOpen
                    ? "opacity-100"
                    : "opacity-0 group-hover/dept:opacity-100",
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => onAddSubDepartment?.(department)}
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                하위 부서 추가
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      {isExpanded && hasChildren && <div className="ml-2">{children}</div>}
    </div>
  );
};
