"use client";

import Image from "next/image";
import { useSidebarStore } from "../model/useSidebarStore";
import { User } from "lucide-react";

export const TabContent = () => {
  const tabs = useSidebarStore((state) => state.tabs);
  const activeTabId = useSidebarStore((state) => state.activeTabId);

  if (tabs.length === 0 || activeTabId === null) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-400">
        <div className="text-center">
          <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>사용자를 더블클릭하여 탭을 열어주세요</p>
        </div>
      </div>
    );
  }

  const activeTab = tabs.find((t) => t.id === activeTabId);

  if (!activeTab) {
    return null;
  }

  return (
    <div className="flex-1 p-6">
      <UserTabContent userId={activeTab.id} />
    </div>
  );
};

interface UserTabContentProps {
  userId: number;
}

const UserTabContent = ({ userId }: UserTabContentProps) => {
  const tabs = useSidebarStore((state) => state.tabs);
  const tab = tabs.find((t) => t.id === userId);

  if (!tab) {
    return null;
  }

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
