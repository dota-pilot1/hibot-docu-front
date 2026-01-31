"use client";

import Image from "next/image";
import { Panel, UserTab } from "../model/useSidebarStore";
import { User } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/shared/lib/utils";

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

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-1 p-6 overflow-auto",
        isOver &&
          isDragging &&
          "bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-400 ring-inset",
      )}
    >
      <UserTabContent tab={activeTab} />
    </div>
  );
};

interface UserTabContentProps {
  tab: UserTab;
}

const UserTabContent = ({ tab }: UserTabContentProps) => {
  const displayName = tab.name || tab.email.split("@")[0];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex items-center gap-4 mb-6">
          {tab.profileImage ? (
            <Image
              src={tab.profileImage}
              alt={displayName}
              width={64}
              height={64}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
              <User className="h-8 w-8 text-zinc-500" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold">{displayName}</h2>
            <p className="text-zinc-500">{tab.email}</p>
          </div>
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
          <h3 className="text-sm font-medium text-zinc-500 mb-2">
            사용자 정보
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                ID
              </span>
              <span className="text-sm font-medium">{tab.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                이메일
              </span>
              <span className="text-sm font-medium">{tab.email}</span>
            </div>
            {tab.name && (
              <div className="flex justify-between">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  이름
                </span>
                <span className="text-sm font-medium">{tab.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
