"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/shared/lib/utils";
import { X, User, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useSidebarStore, UserTab, Panel } from "../model/useSidebarStore";

interface TabHeaderProps {
  panel: Panel;
  onPanelClick: () => void;
}

export const TabHeader = ({ panel, onPanelClick }: TabHeaderProps) => {
  const activePanelId = useSidebarStore((state) => state.activePanelId);
  const setActivePanel = useSidebarStore((state) => state.setActivePanel);
  const setActiveTab = useSidebarStore((state) => state.setActiveTab);
  const closeTab = useSidebarStore((state) => state.closeTab);
  const addPanel = useSidebarStore((state) => state.addPanel);

  const isActivePanel = panel.id === activePanelId;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft <
          container.scrollWidth - container.clientWidth - 1,
      );
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      container?.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [panel.tabs]);

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -150, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 150, behavior: "smooth" });
  };

  const handleTabSelect = (userId: number) => {
    if (!isActivePanel) {
      setActivePanel(panel.id);
    }
    setActiveTab(userId);
  };

  const handleTabClose = (userId: number) => {
    if (!isActivePanel) {
      setActivePanel(panel.id);
    }
    closeTab(userId);
  };

  const handleAddPanel = () => {
    if (!isActivePanel) {
      setActivePanel(panel.id);
    }
    addPanel();
  };

  return (
    <div
      className={cn(
        "flex items-center bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 h-[46px]",
        isActivePanel && "ring-1 ring-blue-400 ring-inset",
      )}
      onClick={onPanelClick}
    >
      {/* 좌우 네비게이션 (붙여서) */}
      <div className="flex items-center shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            scrollLeft();
          }}
          disabled={!canScrollLeft}
          className={cn(
            "p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
            !canScrollLeft && "opacity-30 cursor-default",
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            scrollRight();
          }}
          disabled={!canScrollRight}
          className={cn(
            "p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
            !canScrollRight && "opacity-30 cursor-default",
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* 탭 목록 (스크롤 영역) */}
      <div
        ref={scrollContainerRef}
        className="flex-1 flex items-center gap-1 px-1 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {panel.tabs.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={tab.id === panel.activeTabId}
            onSelect={() => handleTabSelect(tab.id)}
            onClose={() => handleTabClose(tab.id)}
          />
        ))}
      </div>

      {/* + 버튼 (패널 분할) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleAddPanel();
        }}
        className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0 mr-1"
        title="패널 분할"
      >
        <Plus className="h-4 w-4" />
      </button>
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
        "flex items-center gap-2 px-3 py-1.5 rounded-md border cursor-pointer transition-all shrink-0",
        isActive
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
          : "border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800",
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
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
