"use client";

import Image from "next/image";
import { cn } from "@/shared/lib/utils";
import { X, User } from "lucide-react";
import { useSidebarStore, UserTab } from "../model/useSidebarStore";

export const TabHeader = () => {
  const tabs = useSidebarStore((state) => state.tabs);
  const activeTabId = useSidebarStore((state) => state.activeTabId);
  const setActiveTab = useSidebarStore((state) => state.setActiveTab);
  const closeTab = useSidebarStore((state) => state.closeTab);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      {tabs.map((tab) => (
        <TabItem
          key={tab.id}
          tab={tab}
          isActive={tab.id === activeTabId}
          onSelect={() => setActiveTab(tab.id)}
          onClose={() => closeTab(tab.id)}
        />
      ))}
    </div>
  );
};

interface TabItemProps {
  tab: UserTab;
  isActive: boolean;
  onSelect: () => void;
  onClose: () => void;
}

const TabItem = ({ tab, isActive, onSelect, onClose }: TabItemProps) => {
  const displayName = tab.name || tab.email.split("@")[0];

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 border-r border-zinc-200 dark:border-zinc-800 cursor-pointer",
        "hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
        isActive && "bg-zinc-100 dark:bg-zinc-800 border-b-2 border-b-blue-500",
      )}
      onClick={onSelect}
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
      <button
        className={cn(
          "p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors",
          "opacity-60 hover:opacity-100",
        )}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
