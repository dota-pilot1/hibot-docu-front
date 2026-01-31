"use client";

import Image from "next/image";
import { User } from "lucide-react";
import { UserTab } from "../model/useSidebarStore";

interface TabDragPreviewProps {
  tab: UserTab;
}

export const TabDragPreview = ({ tab }: TabDragPreviewProps) => {
  const displayName = tab.name || tab.email.split("@")[0];

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-lg pointer-events-none"
      style={{ width: "fit-content" }}
    >
      {tab.profileImage ? (
        <Image
          src={tab.profileImage}
          alt={displayName}
          width={20}
          height={20}
          className="rounded-full object-cover"
        />
      ) : (
        <div className="h-5 w-5 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
          <User className="h-3 w-3 text-zinc-500" />
        </div>
      )}
      <span className="text-sm font-medium truncate max-w-[120px]">
        {displayName}
      </span>
    </div>
  );
};
