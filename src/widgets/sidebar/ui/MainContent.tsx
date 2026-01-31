"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { useSidebarStore } from "../model/useSidebarStore";
import { TabHeader } from "./TabHeader";
import { TabContent } from "./TabContent";
import { cn } from "@/shared/lib/utils";

interface MainContentProps {
  children?: React.ReactNode;
}

const MIN_PANEL_WIDTH = 0.15; // 최소 15% 비율

export const MainContent = ({ children }: MainContentProps) => {
  const panels = useSidebarStore((state) => state.panels);
  const setActivePanel = useSidebarStore((state) => state.setActivePanel);
  const setPanelWidths = useSidebarStore((state) => state.setPanelWidths);

  const containerRef = useRef<HTMLDivElement>(null);
  const [resizing, setResizing] = useState<{
    handleIndex: number;
    startX: number;
    leftPanelStartWidth: number;
    rightPanelStartWidth: number;
  } | null>(null);

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
            />
            <TabContent panel={panel} />
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
  );
};
