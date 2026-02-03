"use client";

import { useState } from "react";
import { FooterHeader } from "./FooterHeader";
import { FooterBody } from "./FooterBody";

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
}

export const FooterCard = ({ statusCounts }: FooterCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("task");

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
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
      />
      <FooterBody isExpanded={isExpanded} activeTab={activeTab} />
    </div>
  );
};
