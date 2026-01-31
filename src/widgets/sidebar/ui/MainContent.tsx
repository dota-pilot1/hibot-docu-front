"use client";

import { useCallback, useRef, useState, useEffect } from "react";
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
import { useSidebarStore, UserTab } from "../model/useSidebarStore";
import { TabHeader } from "./TabHeader";
import { TabContent } from "./TabContent";
import { TabDragPreview } from "./TabDragPreview";
import { cn } from "@/shared/lib/utils";

interface MainContentProps {
  children?: React.ReactNode;
}

const MIN_PANEL_WIDTH = 0.15; // 최소 15% 비율

export const MainContent = ({ children }: MainContentProps) => {
  const panels = useSidebarStore((state) => state.panels);
  const setActivePanel = useSidebarStore((state) => state.setActivePanel);
  const setPanelWidths = useSidebarStore((state) => state.setPanelWidths);
  const reorderTabs = useSidebarStore((state) => state.reorderTabs);
  const moveTabToPanel = useSidebarStore((state) => state.moveTabToPanel);
  const addPanelWithTab = useSidebarStore((state) => state.addPanelWithTab);

  const containerRef = useRef<HTMLDivElement>(null);
  const [resizing, setResizing] = useState<{
    handleIndex: number;
    startX: number;
    leftPanelStartWidth: number;
    rightPanelStartWidth: number;
  } | null>(null);

  // 드래그 중인 탭
  const [activeTab, setActiveTab] = useState<UserTab | null>(null);

  // dnd-kit 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px 이상 이동해야 드래그 시작
      },
    }),
  );

  // 패널에서 탭 찾기 헬퍼
  const findPanelByTabId = useCallback(
    (tabId: number) => {
      return panels.find((p) => p.tabs.some((t) => t.id === tabId));
    },
    [panels],
  );

  // 드래그 시작
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const tabId = active.id as number;
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

  // 드래그 종료
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTab(null);

      if (!over) return;

      const activeTabId = active.id as number;
      const fromPanel = findPanelByTabId(activeTabId);
      if (!fromPanel) return;

      const fromIndex = fromPanel.tabs.findIndex((t) => t.id === activeTabId);

      // over가 TAB인 경우 (id가 "tab-drop-{tabId}" 형식)
      if (over.data.current?.type === "TAB") {
        const overTabId = over.data.current.tabId as number;
        const toPanel = findPanelByTabId(overTabId);
        if (!toPanel) return;

        const toIndex = toPanel.tabs.findIndex((t) => t.id === overTabId);

        if (fromPanel.id === toPanel.id) {
          // 같은 패널 내 순서 변경
          if (fromIndex !== toIndex) {
            reorderTabs(fromPanel.id, fromIndex, toIndex);
          }
        } else {
          // 다른 패널로 이동
          moveTabToPanel(fromPanel.id, toPanel.id, activeTabId, toIndex);
        }
        return;
      }

      // over가 PANEL인 경우 (빈 패널 또는 패널 영역)
      if (over.data.current?.type === "PANEL") {
        const toPanelId = over.id as string;
        if (fromPanel.id !== toPanelId) {
          moveTabToPanel(fromPanel.id, toPanelId, activeTabId);
        }
        return;
      }

      // over가 CONTENT인 경우 (본문 영역에 드롭 - 새 패널 생성)
      if (over.data.current?.type === "CONTENT") {
        const targetPanelId = over.data.current.panelId as string;
        // 새 패널 생성 후 탭 이동
        addPanelWithTab(fromPanel.id, activeTabId, targetPanelId);
      }
    },
    [findPanelByTabId, reorderTabs, moveTabToPanel, addPanelWithTab],
  );

  // 커스텀 collision detection - 탭과 패널 모두 감지
  const collisionDetection = useCallback(
    (args: Parameters<typeof pointerWithin>[0]) => {
      // 먼저 포인터가 위치한 곳의 요소들 찾기
      const pointerCollisions = pointerWithin(args);

      // TAB 타입이 있으면 우선
      const tabCollision = pointerCollisions.find(
        (c) => c.data?.droppableContainer?.data?.current?.type === "TAB",
      );
      if (tabCollision) {
        return [tabCollision];
      }

      // PANEL 타입이 있으면 반환
      const panelCollision = pointerCollisions.find(
        (c) => c.data?.droppableContainer?.data?.current?.type === "PANEL",
      );
      if (panelCollision) {
        return [panelCollision];
      }

      // CONTENT 타입이 있으면 반환 (본문 영역 드롭)
      const contentCollision = pointerCollisions.find(
        (c) => c.data?.droppableContainer?.data?.current?.type === "CONTENT",
      );
      if (contentCollision) {
        return [contentCollision];
      }

      // 없으면 rectIntersection으로 fallback
      return rectIntersection(args);
    },
    [],
  );

  // 리사이즈 핸들러
  const handleMouseDown = useCallback(
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

        // 최소 너비 제한
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div ref={containerRef} className="flex h-full">
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
              <TabHeader
                panel={panel}
                onPanelClick={() => setActivePanel(panel.id)}
                isDragging={activeTab !== null}
              />
              <TabContent panel={panel} isDragging={activeTab !== null} />
            </div>

            {/* 패널 간 리사이즈 핸들 (마지막 패널 제외) */}
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
                onMouseDown={(e) => handleMouseDown(e, index)}
              />
            )}
          </div>
        ))}
      </div>

      {/* 드래그 미리보기 */}
      <DragOverlay>
        {activeTab ? <TabDragPreview tab={activeTab} /> : null}
      </DragOverlay>
    </DndContext>
  );
};
