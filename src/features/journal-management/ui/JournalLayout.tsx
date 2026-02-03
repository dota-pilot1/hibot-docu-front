"use client";

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
  pointerWithin,
} from "@dnd-kit/core";
import { JournalSidebar } from "./JournalSidebar";
import { JournalTabBar } from "./JournalTabBar";
import { JournalDetailView } from "./JournalDetailView";
import { JournalTabDragPreview } from "./JournalTabDragPreview";
import { useJournalTabStore, JournalTab } from "../model/useJournalTabStore";
import { cn } from "@/shared/lib/utils";
import type { JournalType, JournalCategory } from "../api/journalApi";

interface JournalLayoutProps {
  journalType: JournalType;
}

const MIN_PANEL_WIDTH = 0.15;

export const JournalLayout: React.FC<JournalLayoutProps> = ({
  journalType,
}) => {
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [expandedTeams, setExpandedTeams] = useState<Set<number>>(new Set());
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  const panels = useJournalTabStore((s) => s.panels);
  const activePanelId = useJournalTabStore((s) => s.activePanelId);
  const openTab = useJournalTabStore((s) => s.openTab);
  const setActivePanel = useJournalTabStore((s) => s.setActivePanel);
  const setPanelWidths = useJournalTabStore((s) => s.setPanelWidths);
  const reorderTabs = useJournalTabStore((s) => s.reorderTabs);
  const moveTabToPanel = useJournalTabStore((s) => s.moveTabToPanel);
  const addPanelWithTab = useJournalTabStore((s) => s.addPanelWithTab);

  const containerRef = useRef<HTMLDivElement>(null);
  const [resizing, setResizing] = useState<{
    handleIndex: number;
    startX: number;
    leftPanelStartWidth: number;
    rightPanelStartWidth: number;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<JournalTab | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const findPanelByTabId = useCallback(
    (tabId: string) => {
      return panels.find((p) => p.tabs.some((t) => t.id === tabId));
    },
    [panels],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const tabId = active.id as string;
      const panel = findPanelByTabId(tabId);
      if (panel) {
        const tab = panel.tabs.find((t) => t.id === tabId);
        if (tab) {
          setActiveTab(tab);
        }
      }
    },
    [findPanelByTabId],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTab(null);

      if (!over) return;

      const activeTabId = active.id as string;
      const fromPanel = findPanelByTabId(activeTabId);
      if (!fromPanel) return;

      const fromIndex = fromPanel.tabs.findIndex((t) => t.id === activeTabId);

      if (over.data.current?.type === "TAB") {
        const overTabId = over.data.current.tabId as string;
        const toPanel = findPanelByTabId(overTabId);
        if (!toPanel) return;

        const toIndex = toPanel.tabs.findIndex((t) => t.id === overTabId);

        if (fromPanel.id === toPanel.id) {
          if (fromIndex !== toIndex) {
            reorderTabs(fromPanel.id, fromIndex, toIndex);
          }
        } else {
          moveTabToPanel(fromPanel.id, toPanel.id, activeTabId, toIndex);
        }
        return;
      }

      if (over.data.current?.type === "PANEL") {
        const toPanelId = over.id as string;
        if (fromPanel.id !== toPanelId) {
          moveTabToPanel(fromPanel.id, toPanelId, activeTabId);
        }
        return;
      }

      if (over.data.current?.type === "CONTENT") {
        const targetPanelId = over.data.current.panelId as string;
        addPanelWithTab(fromPanel.id, activeTabId, targetPanelId);
      }
    },
    [findPanelByTabId, reorderTabs, moveTabToPanel, addPanelWithTab],
  );

  const collisionDetection = useCallback(
    (args: Parameters<typeof pointerWithin>[0]) => {
      const pointerCollisions = pointerWithin(args);

      const tabCollision = pointerCollisions.find(
        (c) => c.data?.droppableContainer?.data?.current?.type === "TAB",
      );
      if (tabCollision) {
        return [tabCollision];
      }

      const panelCollision = pointerCollisions.find(
        (c) => c.data?.droppableContainer?.data?.current?.type === "PANEL",
      );
      if (panelCollision) {
        return [panelCollision];
      }

      const contentCollision = pointerCollisions.find(
        (c) => c.data?.droppableContainer?.data?.current?.type === "CONTENT",
      );
      if (contentCollision) {
        return [contentCollision];
      }

      return rectIntersection(args);
    },
    [],
  );

  const handleSidebarResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX;
      const newWidth = Math.min(Math.max(startWidth + diff, 180), 360);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handlePanelResizeStart = useCallback(
    (e: React.MouseEvent, handleIndex: number) => {
      e.preventDefault();
      const leftPanel = panels[handleIndex];
      const rightPanel = panels[handleIndex + 1];

      setResizing({
        handleIndex,
        startX: e.clientX,
        leftPanelStartWidth: leftPanel.width,
        rightPanelStartWidth: rightPanel.width,
      });
    },
    [panels],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!resizing || !containerRef.current) return;

      requestAnimationFrame(() => {
        const containerWidth = containerRef.current?.clientWidth || 1;
        const totalWidth =
          resizing.leftPanelStartWidth + resizing.rightPanelStartWidth;
        const deltaX = e.clientX - resizing.startX;
        const deltaRatio = deltaX / containerWidth;

        let newLeftWidth =
          resizing.leftPanelStartWidth + deltaRatio * totalWidth;
        let newRightWidth =
          resizing.rightPanelStartWidth - deltaRatio * totalWidth;

        if (newLeftWidth < MIN_PANEL_WIDTH * totalWidth) {
          newLeftWidth = MIN_PANEL_WIDTH * totalWidth;
          newRightWidth = totalWidth - newLeftWidth;
        }
        if (newRightWidth < MIN_PANEL_WIDTH * totalWidth) {
          newRightWidth = MIN_PANEL_WIDTH * totalWidth;
          newLeftWidth = totalWidth - newRightWidth;
        }

        const leftPanel = panels[resizing.handleIndex];
        const rightPanel = panels[resizing.handleIndex + 1];

        setPanelWidths(
          leftPanel.id,
          rightPanel.id,
          newLeftWidth,
          newRightWidth,
        );
      });
    },
    [resizing, panels, setPanelWidths],
  );

  const handleMouseUp = useCallback(() => {
    setResizing(null);
  }, []);

  useEffect(() => {
    if (resizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [resizing, handleMouseMove, handleMouseUp]);

  const handleToggleTeam = useCallback((id: number) => {
    setExpandedTeams((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // 날짜 카테고리 선택 시 탭 열기
  const handleSelectCategory = useCallback(
    (category: JournalCategory) => {
      setSelectedCategoryId(category.id);
      openTab({
        categoryId: category.id,
        title: category.name,
      });
    },
    [openTab],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full bg-gray-50 dark:bg-zinc-950">
        {/* 사이드바 */}
        <div
          className="flex-shrink-0 border-r border-gray-200 dark:border-zinc-800"
          style={{ width: sidebarWidth }}
        >
          <JournalSidebar
            journalType={journalType}
            selectedCategoryId={selectedCategoryId}
            expandedTeams={expandedTeams}
            onSelectCategory={handleSelectCategory}
            onToggleTeam={handleToggleTeam}
          />
        </div>

        {/* 리사이즈 핸들 */}
        <div
          className="w-1 bg-transparent hover:bg-blue-500/50 cursor-col-resize transition-colors flex-shrink-0"
          onMouseDown={handleSidebarResizeStart}
        />

        {/* 메인 영역 - 패널들 */}
        <div ref={containerRef} className="flex-1 flex min-w-0">
          {panels.map((panel, index) => (
            <div
              key={panel.id}
              className="flex min-w-0"
              style={{ flex: panel.width }}
            >
              {/* 패널 */}
              <div
                className="flex-1 flex flex-col min-w-0"
                onClick={() => setActivePanel(panel.id)}
              >
                {/* 탭바 */}
                <JournalTabBar
                  panel={panel}
                  onPanelClick={() => setActivePanel(panel.id)}
                  isDragging={activeTab !== null}
                />

                {/* 상세 뷰 */}
                <div className="flex-1 min-h-0">
                  <JournalDetailView
                    panel={panel}
                    isDragging={activeTab !== null}
                  />
                </div>
              </div>

              {/* 패널 간 리사이즈 핸들 */}
              {index < panels.length - 1 && (
                <div
                  className={cn(
                    "w-1 shrink-0 cursor-col-resize",
                    "bg-zinc-200 dark:bg-zinc-700",
                    "hover:bg-blue-400 dark:hover:bg-blue-500",
                    resizing?.handleIndex === index &&
                      "bg-blue-400 dark:bg-blue-500",
                    !resizing && "transition-colors",
                  )}
                  onMouseDown={(e) => handlePanelResizeStart(e, index)}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 드래그 미리보기 */}
      <DragOverlay>
        {activeTab ? <JournalTabDragPreview tab={activeTab} /> : null}
      </DragOverlay>
    </DndContext>
  );
};
