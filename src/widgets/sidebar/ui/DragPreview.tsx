"use client";

import { User } from "lucide-react";
import type { OrganizationUser } from "@/features/organization/api/organizationApi";

interface DragPreviewProps {
  user: OrganizationUser;
}

export const DragPreview = ({ user }: DragPreviewProps) => {
  const displayName = user.name || user.email.split("@")[0];

  return (
    <div className="flex items-center gap-2 p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 cursor-grabbing">
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
      <span className="text-sm font-medium">{displayName}</span>
    </div>
  );
};
