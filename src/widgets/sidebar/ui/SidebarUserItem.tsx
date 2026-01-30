"use client";

import { cn } from "@/shared/lib/utils";
import { User, MessageCircle, GripVertical } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { OrganizationUser } from "@/features/organization/api/organizationApi";

interface SidebarUserItemProps {
  user: OrganizationUser;
  departmentId?: number | null;
  collapsed?: boolean;
  indent?: boolean;
  isDragDisabled?: boolean;
}

export const SidebarUserItem = ({
  user,
  departmentId,
  collapsed,
  indent,
  isDragDisabled,
}: SidebarUserItemProps) => {
  const displayName = user.name || user.email.split("@")[0];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: user.id,
    data: {
      type: "user",
      user,
      departmentId,
    },
    disabled: isDragDisabled || collapsed,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = () => {
    // TODO: 채팅 또는 프로필
  };

  if (collapsed) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="w-full h-10 relative"
        onClick={handleClick}
        title={displayName}
      >
        {user.profileImage ? (
          <img
            src={user.profileImage}
            alt={displayName}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
            <User className="h-4 w-4 text-zinc-500" />
          </div>
        )}
      </Button>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg",
        "hover:bg-zinc-100 dark:hover:bg-zinc-800",
        "transition-colors group",
        indent && "ml-4",
        isDragging && "opacity-50 shadow-lg bg-white dark:bg-zinc-800 z-50",
      )}
      onClick={handleClick}
    >
      {/* 드래그 핸들 */}
      {!isDragDisabled && (
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "cursor-grab active:cursor-grabbing p-0.5 -ml-1 rounded",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            "hover:bg-zinc-200 dark:hover:bg-zinc-700",
          )}
        >
          <GripVertical className="h-4 w-4 text-zinc-400" />
        </div>
      )}

      <div className="relative shrink-0">
        {user.profileImage ? (
          <img
            src={user.profileImage}
            alt={displayName}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
            <User className="h-4 w-4 text-zinc-500" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium truncate">{displayName}</span>
          {user.role === "ADMIN" && (
            <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded font-medium">
              Admin
            </span>
          )}
        </div>
        <span className="text-xs text-zinc-500 truncate block">
          {user.email}
        </span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 h-8 w-8"
        onClick={(e) => {
          e.stopPropagation();
          // TODO: 1:1 채팅
        }}
      >
        <MessageCircle className="h-4 w-4" />
      </Button>
    </div>
  );
};
