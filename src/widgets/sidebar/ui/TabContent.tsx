"use client";

import { Panel, UserTab } from "../model/useSidebarStore";
import { User } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/shared/lib/utils";
import { UserDetailLayout } from "@/widgets/user-detail";

interface TabContentProps {
  panel: Panel;
  isDragging?: boolean;
}

export const TabContent = ({ panel, isDragging }: TabContentProps) => {
  // 본문 영역 드롭 - 새 패널 생성용
  const { setNodeRef, isOver } = useDroppable({
    id: `content-drop-${panel.id}`,
    data: { type: "CONTENT", panelId: panel.id },
  });

  if (panel.tabs.length === 0 || panel.activeTabId === null) {
    return (
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 flex items-center justify-center text-zinc-400",
          isOver &&
            isDragging &&
            "bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-400 ring-inset",
        )}
      >
        <div className="text-center">
          <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>사용자를 더블클릭하여 탭을 열어주세요</p>
        </div>
      </div>
    );
  }

  const activeTab = panel.tabs.find((t) => t.id === panel.activeTabId);

  if (!activeTab) {
    return null;
  }

  const displayName = activeTab.name || activeTab.email.split("@")[0];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-1 overflow-hidden",
        isOver &&
          isDragging &&
          "bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-400 ring-inset",
      )}
    >
      <UserDetailLayout userId={activeTab.id} userName={displayName} />
    </div>
  );
};
