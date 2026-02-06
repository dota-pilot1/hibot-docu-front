"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  FileText,
  Folder,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  useDocumentStore,
  DocumentPanel,
  DocumentTab,
} from "@/widgets/document-sidebar";
import { useDraggable, useDroppable } from "@dnd-kit/core";

interface DocumentTabBarProps {
  panel: DocumentPanel;
  onPanelClick: () => void;
  isDragging?: boolean;
}

export const DocumentTabBar = ({
  panel,
  onPanelClick,
  isDragging,
}: DocumentTabBarProps) => {
  const [mounted, setMounted] = useState(false);
  const activePanelId = useDocumentStore((s) => s.activePanelId);
  const panels = useDocumentStore((s) => s.panels);
  const setActivePanel = useDocumentStore((s) => s.setActivePanel);
  const addPanel = useDocumentStore((s) => s.addPanel);
  const removePanel = useDocumentStore((s) => s.removePanel);

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

  useEffect(() => {
    setMounted(true);
  }, []);

  const checkScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const newCanScrollLeft = container.scrollLeft > 0;
      const newCanScrollRight =
        container.scrollLeft <
        container.scrollWidth - container.clientWidth - 1;

      setCanScrollLeft((prev) =>
        prev !== newCanScrollLeft ? newCanScrollLeft : prev,
      );
      setCanScrollRight((prev) =>
        prev !== newCanScrollRight ? newCanScrollRight : prev,
      );
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

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
  }, [mounted, panel.tabs.length, checkScroll]);

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -150, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 150, behavior: "smooth" });
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
            탭을 여기로 드래그하세요
          </span>
        ) : (
          panel.tabs.map((tab) => (
            <DraggableDocumentTab
              key={tab.id}
              tab={tab}
              panelId={panel.id}
              isActive={tab.id === panel.activeTabId}
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

interface DraggableDocumentTabProps {
  tab: DocumentTab;
  panelId: string;
  isActive: boolean;
}

const DraggableDocumentTab = ({
  tab,
  panelId,
  isActive,
}: DraggableDocumentTabProps) => {
  const setActivePanel = useDocumentStore((s) => s.setActivePanel);
  const setActiveTab = useDocumentStore((s) => s.setActiveTab);
  const closeTab = useDocumentStore((s) => s.closeTab);
  const activePanelId = useDocumentStore((s) => s.activePanelId);

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `doc-tab-drop-${tab.id}`,
    data: { type: "TAB", tabId: tab.id },
  });

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    isDragging,
  } = useDraggable({
    id: tab.id,
    data: { type: "TAB", tab, panelId },
  });

  const handleSelect = () => {
    if (panelId !== activePanelId) {
      setActivePanel(panelId);
    }
    setActiveTab(tab.id);
  };

  const handleClose = () => {
    if (panelId !== activePanelId) {
      setActivePanel(panelId);
    }
    closeTab(tab.id);
  };

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
          handleSelect();
        }}
        {...attributes}
        {...listeners}
      >
        {tab.type === "folder" && tab.folderType === "figma" ? (
          <svg
            className="h-4 w-4 shrink-0 pointer-events-none text-purple-500"
            viewBox="0 0 38 57"
            fill="currentColor"
          >
            <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" />
            <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" />
            <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" />
            <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" />
            <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" />
          </svg>
        ) : tab.type === "folder" ? (
          <Folder className="h-4 w-4 shrink-0 pointer-events-none text-yellow-500" />
        ) : (
          <FileText className="h-4 w-4 shrink-0 pointer-events-none" />
        )}
        <span className="text-sm font-medium truncate max-w-[120px] pointer-events-none">
          {tab.isDirty && <span className="text-blue-500 mr-1">*</span>}
          {tab.title}
        </span>
        <button
          className={cn(
            "p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors",
            "opacity-60 hover:opacity-100",
          )}
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
