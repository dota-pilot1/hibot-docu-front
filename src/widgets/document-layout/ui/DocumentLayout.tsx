"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { useDocumentStore } from "@/widgets/document-sidebar";
import { DocumentSidebar } from "@/widgets/document-sidebar";
import { DocumentMainContent } from "@/widgets/document-content";
import { cn } from "@/shared/lib/utils";

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 400;

export const DocumentLayout = () => {
  const isOpen = useDocumentStore((s) => s.isOpen);
  const sidebarWidth = useDocumentStore((s) => s.sidebarWidth);
  const setSidebarWidth = useDocumentStore((s) => s.setSidebarWidth);

  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      requestAnimationFrame(() => {
        const newWidth = e.clientX;
        if (newWidth >= MIN_SIDEBAR_WIDTH && newWidth <= MAX_SIDEBAR_WIDTH) {
          if (sidebarRef.current) {
            sidebarRef.current.style.width = `${newWidth}px`;
          }
        }
      });
    },
    [isResizing],
  );

  const handleMouseUp = useCallback(() => {
    if (sidebarRef.current) {
      const finalWidth = parseInt(sidebarRef.current.style.width, 10);
      if (finalWidth >= MIN_SIDEBAR_WIDTH && finalWidth <= MAX_SIDEBAR_WIDTH) {
        setSidebarWidth(finalWidth);
      }
    }
    setIsResizing(false);
  }, [setSidebarWidth]);

  useEffect(() => {
    if (isResizing) {
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
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const currentWidth = sidebarWidth >= MIN_SIDEBAR_WIDTH && sidebarWidth <= MAX_SIDEBAR_WIDTH
    ? sidebarWidth
    : 256;

  return (
    <div className="flex h-full overflow-hidden">
      {/* 사이드바 */}
      <div
        ref={sidebarRef}
        className={cn(
          "h-full border-r border-zinc-200 dark:border-zinc-800 shrink-0",
          !isResizing && "transition-all duration-300 ease-in-out",
        )}
        style={{ width: isOpen ? currentWidth : 48 }}
      >
        <DocumentSidebar />
      </div>

      {/* 리사이즈 핸들 (열려있을 때만) */}
      {isOpen && (
        <div
          className={cn(
            "w-1 h-full cursor-col-resize shrink-0",
            "bg-zinc-200 dark:bg-zinc-700",
            "hover:bg-blue-400 dark:hover:bg-blue-500",
            "transition-colors",
            isResizing && "bg-blue-400 dark:bg-blue-500",
          )}
          onMouseDown={handleMouseDown}
        />
      )}

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-hidden">
        <DocumentMainContent />
      </div>
    </div>
  );
};
