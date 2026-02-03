"use client";

import { useState } from "react";
import { FooterHeader } from "./FooterHeader";
import { FooterBody } from "./FooterBody";
import { TaskNotification } from "../model/useTaskNotifications";

export type TabType = "notice" | "task" | "favorite";

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

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
    if (!isExpanded) {
      // 푸터 열 때 새 알림 표시 제거
      onClearNewNotifications();
    }
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 shadow-lg"
      style={{ zIndex: 900 }}
    >
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
        isExpanded={isExpanded}
        activeTab={activeTab}
        notifications={notifications}
      />
    </div>
  );
};
