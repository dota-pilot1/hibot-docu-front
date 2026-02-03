"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { FooterHeader } from "./FooterHeader";
import { FooterBody } from "./FooterBody";
import { TaskNotification } from "../model/useTaskNotifications";
import { cn } from "@/shared/lib/utils";

export type TabType = "notice" | "task" | "favorite";

const DEFAULT_FOOTER_HEIGHT = 200;
const MIN_FOOTER_HEIGHT = 100;
const MAX_FOOTER_HEIGHT = 500;

interface StatusCounts {
  pending: number;
  inProgress: number;
  completed: number;
  blocked: number;
  delayed: number;
}

interface FooterCardProps {
  statusCounts: StatusCounts;
  notifications: TaskNotification[];
  hasNewNotifications: boolean;
  onClearNewNotifications: () => void;
  isWebSocketConnected: boolean;
}

export const FooterCard = ({
  statusCounts,
  notifications,
  hasNewNotifications,
  onClearNewNotifications,
  isWebSocketConnected,
}: FooterCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("task");
  const [footerHeight, setFooterHeight] = useState(DEFAULT_FOOTER_HEIGHT);
  const [isResizing, setIsResizing] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(0);
  const hasDraggedRef = useRef<boolean>(false);

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
    if (!isExpanded) {
      onClearNewNotifications();
    }
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      startYRef.current = e.clientY;
      startHeightRef.current = footerHeight;
      hasDraggedRef.current = false;
      setIsResizing(true);
    },
    [footerHeight],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaY = startYRef.current - e.clientY;
      // 5px 이상 움직여야 드래그로 인식
      if (Math.abs(deltaY) > 5) {
        hasDraggedRef.current = true;
      }

      if (!hasDraggedRef.current) return;

      requestAnimationFrame(() => {
        const newHeight = startHeightRef.current + deltaY;
        if (newHeight >= MIN_FOOTER_HEIGHT && newHeight <= MAX_FOOTER_HEIGHT) {
          if (bodyRef.current) {
            bodyRef.current.style.height = `${newHeight}px`;
          }
        }
      });
    },
    [isResizing],
  );

  const handleMouseUp = useCallback(() => {
    if (hasDraggedRef.current && bodyRef.current) {
      const finalHeight = parseInt(bodyRef.current.style.height, 10);
      if (
        !isNaN(finalHeight) &&
        finalHeight >= MIN_FOOTER_HEIGHT &&
        finalHeight <= MAX_FOOTER_HEIGHT
      ) {
        setFooterHeight(finalHeight);
      }
    }
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "row-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={footerRef}
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 shadow-lg"
      style={{ zIndex: 900 }}
    >
      {/* 리사이즈 핸들 (열려있을 때만) */}
      {isExpanded && (
        <div
          className={cn(
            "h-1 w-full cursor-row-resize",
            "bg-zinc-200 dark:bg-zinc-700",
            "hover:bg-blue-400 dark:hover:bg-blue-500",
            "transition-colors",
            isResizing && "bg-blue-400 dark:bg-blue-500",
          )}
          onMouseDown={handleMouseDown}
        />
      )}
      <FooterHeader
        isExpanded={isExpanded}
        onToggle={handleToggle}
        statusCounts={statusCounts}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasNewNotifications={hasNewNotifications && !isExpanded}
        isWebSocketConnected={isWebSocketConnected}
      />
      <FooterBody
        ref={bodyRef}
        isExpanded={isExpanded}
        activeTab={activeTab}
        notifications={notifications}
        height={footerHeight}
        isResizing={isResizing}
      />
    </div>
  );
};
