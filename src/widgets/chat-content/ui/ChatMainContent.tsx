"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Users } from "lucide-react";
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
  useDroppable,
} from "@dnd-kit/core";
import { useChatStore, chatStore, ChatTab, ChatPanel } from "@/widgets/chat-sidebar";
import { ChatTabBar } from "./ChatTabBar";
import { cn } from "@/shared/lib/utils";

const MIN_PANEL_WIDTH = 0.15;

export const ChatMainContent = () => {
  const [mounted, setMounted] = useState(false);
  const panels = useChatStore((s) => s.panels);
  const setActivePanel = useChatStore((s) => s.setActivePanel);
  const setPanelWidths = useChatStore((s) => s.setPanelWidths);
  const reorderTabs = useChatStore((s) => s.reorderTabs);
  const moveTabToPanel = useChatStore((s) => s.moveTabToPanel);
  const addPanelWithTab = useChatStore((s) => s.addPanelWithTab);

  const containerRef = useRef<HTMLDivElement>(null);
  const [resizing, setResizing] = useState<{
    handleIndex: number;
    startX: number;
    leftPanelStartWidth: number;
    rightPanelStartWidth: number;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<ChatTab | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const findPanelByTabId = useCallback(
    (tabId: number) => {
      return panels.find((p) => p.tabs.some((t) => t.id === tabId));
    },
    [panels],
  );

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

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTab(null);

      if (!over) return;

      const activeTabId = active.id as number;
      const fromPanel = findPanelByTabId(activeTabId);
      if (!fromPanel) return;

      const fromIndex = fromPanel.tabs.findIndex((t) => t.id === activeTabId);

      if (over.data.current?.type === "TAB") {
        const overTabId = over.data.current.tabId as number;
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
      if (tabCollision) return [tabCollision];

      const panelCollision = pointerCollisions.find(
        (c) => c.data?.droppableContainer?.data?.current?.type === "PANEL",
      );
      if (panelCollision) return [panelCollision];

      const contentCollision = pointerCollisions.find(
        (c) => c.data?.droppableContainer?.data?.current?.type === "CONTENT",
      );
      if (contentCollision) return [contentCollision];

      return rectIntersection(args);
    },
    [],
  );

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

  if (!mounted) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
        <div className="flex-1 flex items-center justify-center text-zinc-400">
          <Users className="h-16 w-16" />
        </div>
      </div>
    );
  }

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
            <div
              className="flex-1 flex flex-col min-w-0"
              onClick={() => setActivePanel(panel.id)}
            >
              <ChatTabBar
                panel={panel}
                onPanelClick={() => setActivePanel(panel.id)}
                isDragging={activeTab !== null}
              />
              <ChatTabContent panel={panel} isDragging={activeTab !== null} />
            </div>

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

      <DragOverlay>
        {activeTab ? <ChatTabDragPreview tab={activeTab} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

interface ChatTabContentProps {
  panel: ChatPanel;
  isDragging: boolean;
}

const ChatTabContent = ({ panel, isDragging }: ChatTabContentProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `chat-content-${panel.id}`,
    data: { type: "CONTENT", panelId: panel.id },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-1 overflow-hidden bg-white dark:bg-zinc-950",
        isOver && isDragging && "bg-blue-50 dark:bg-blue-900/20",
      )}
    >
      <div className="flex flex-col items-center justify-center h-full text-zinc-400">
        <Users className="h-16 w-16 mb-4" />
        <p className="text-lg">구현 예정</p>
        <p className="text-sm mt-1">채팅 기능은 추후 구현 예정입니다</p>
      </div>
    </div>
  );
};

interface ChatTabDragPreviewProps {
  tab: ChatTab;
}

const ChatTabDragPreview = ({ tab }: ChatTabDragPreviewProps) => {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-lg">
      <Users className="h-4 w-4 shrink-0" />
      <span className="text-sm font-medium truncate max-w-[120px]">
        {tab.title}
      </span>
    </div>
  );
};
