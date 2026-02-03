"use client";

import { useEffect, useState, useRef } from "react";
import { X, FileText, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import {
  useJournalTabStore,
  JournalPanel,
  JournalTab,
} from "../model/useJournalTabStore";

interface JournalTabBarProps {
  panel: JournalPanel;
  onPanelClick: () => void;
  isDragging?: boolean;
}

export const JournalTabBar = ({
  panel,
  onPanelClick,
  isDragging,
}: JournalTabBarProps) => {
  const [mounted, setMounted] = useState(false);
  const activePanelId = useJournalTabStore((s) => s.activePanelId);
  const setActiveTab = useJournalTabStore((s) => s.setActiveTab);
  const closeTab = useJournalTabStore((s) => s.closeTab);
  const setActivePanel = useJournalTabStore((s) => s.setActivePanel);
  const addPanel = useJournalTabStore((s) => s.addPanel);
  const removePanel = useJournalTabStore((s) => s.removePanel);
  const panels = useJournalTabStore((s) => s.panels);

  const isActivePanel = panel.id === activePanelId;
  const panelIndex = panels.findIndex((p) => p.id === panel.id);
  const isFirstPanel = panelIndex === 0;

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: panel.id,
    data: { type: "PANEL", panelId: panel.id },
  });

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
    setMounted(true);
  }, []);

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

  const handleTabSelect = (tabId: string) => {
    if (!isActivePanel) {
      setActivePanel(panel.id);
    }
    setActiveTab(tabId);
  };

  const handleTabClose = (tabId: string) => {
    if (!isActivePanel) {
      setActivePanel(panel.id);
    }
    closeTab(tabId);
  };

  const handleAddPanel = () => {
    if (!isActivePanel) {
      setActivePanel(panel.id);
    }
    addPanel();
  };

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "flex items-center bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 h-[46px]",
        isActivePanel && "ring-1 ring-blue-400 ring-inset",
      )}
      onClick={onPanelClick}
    >
      {/* 좌우 네비게이션 */}
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

      {/* 탭 목록 */}
      <div
        ref={(node) => {
          setDroppableRef(node);
          (
            scrollContainerRef as React.MutableRefObject<HTMLDivElement | null>
          ).current = node;
        }}
        className={cn(
          "flex-1 flex items-center gap-1 px-1 overflow-x-auto scrollbar-hide min-h-[46px]",
          isOver && isDragging && "bg-blue-100 dark:bg-blue-900/30",
          panel.tabs.length === 0 && "justify-center text-zinc-400 text-sm",
        )}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {panel.tabs.length === 0 ? (
          <span className="pointer-events-none select-none">
            날짜를 선택해주세요
          </span>
        ) : (
          panel.tabs.map((tab) => (
            <DraggableTabItem
              key={tab.id}
              tab={tab}
              isActive={tab.id === panel.activeTabId}
              onSelect={() => handleTabSelect(tab.id)}
              onClose={() => handleTabClose(tab.id)}
            />
          ))
        )}
      </div>

      {/* 오른쪽 + - 버튼 */}
      <div className="flex items-center shrink-0 mr-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddPanel();
          }}
          className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="패널 분할"
        >
          <Plus className="h-4 w-4" />
        </button>
        {!isFirstPanel && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              removePanel(panel.id);
            }}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="패널 닫기"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

interface DraggableTabItemProps {
  tab: JournalTab;
  isActive: boolean;
  onSelect: () => void;
  onClose: () => void;
}

const DraggableTabItem = ({
  tab,
  isActive,
  onSelect,
  onClose,
}: DraggableTabItemProps) => {
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `tab-drop-${tab.id}`,
    data: { type: "TAB", tabId: tab.id },
  });

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    isDragging,
  } = useDraggable({
    id: tab.id,
    data: { type: "TAB", tab },
  });

  return (
    <div ref={setDroppableRef} className="shrink-0">
      <div
        ref={setDraggableRef}
        style={{ opacity: isDragging ? 0.4 : 1 }}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md border cursor-grab",
          isActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
            : "border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800",
          isOver && !isDragging && "ring-2 ring-blue-400",
        )}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        {...attributes}
        {...listeners}
      >
        <FileText className="h-4 w-4 shrink-0 pointer-events-none" />
        <span className="text-sm font-medium truncate max-w-[120px] pointer-events-none">
          {tab.title}
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
    </div>
  );
};
