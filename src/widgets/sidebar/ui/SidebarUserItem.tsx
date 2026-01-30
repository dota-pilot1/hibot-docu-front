"use client";

import { cn } from "@/shared/lib/utils";
import { User, MessageCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { OrganizationUser } from "@/features/organization/api/organizationApi";

interface SidebarUserItemProps {
  user: OrganizationUser;
  collapsed?: boolean;
  indent?: boolean;
}

export const SidebarUserItem = ({
  user,
  collapsed,
  indent,
}: SidebarUserItemProps) => {
  const displayName = user.name || user.email.split("@")[0];

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
      className={cn(
        "flex items-center gap-3 p-2 rounded-lg cursor-pointer",
        "hover:bg-zinc-100 dark:hover:bg-zinc-800",
        "transition-colors group",
        indent && "ml-4",
      )}
      onClick={handleClick}
    >
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
