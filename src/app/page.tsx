"use client";

import { useState } from "react";
import { X, User, Construction } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface Tab {
  id: string;
  label: string;
  type: "user" | "feature";
  data?: any;
}

export default function Home() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const closeTab = (tabId: string) => {
    setTabs((prev) => prev.filter((t) => t.id !== tabId));
    if (activeTabId === tabId) {
      const remaining = tabs.filter((t) => t.id !== tabId);
      setActiveTabId(
        remaining.length > 0 ? remaining[remaining.length - 1].id : null,
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 2차 헤더 - 탭 영역 */}
      <div className="h-10 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-2 gap-1 shrink-0">
        {tabs.length === 0 ? (
          <span className="text-sm text-zinc-400 px-2">
            왼쪽 사이드바에서 사용자를 클릭하면 탭으로 등록됩니다
          </span>
        ) : (
          tabs.map((tab) => (
            <div
              key={tab.id}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-t-md cursor-pointer text-sm transition-colors",
                activeTabId === tab.id
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-t border-x border-zinc-200 dark:border-zinc-700"
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700",
              )}
              onClick={() => setActiveTabId(tab.id)}
            >
              <User className="h-3.5 w-3.5" />
              <span className="max-w-[120px] truncate">{tab.label}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className="hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* 본문 영역 */}
      <div className="flex-1 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        {activeTabId ? (
          <div className="text-center">
            <Construction className="h-16 w-16 text-zinc-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
              구현 예정
            </h2>
            <p className="text-sm text-zinc-400">
              사용자 상세 정보 및 관리 기능이 이 영역에 표시됩니다
            </p>
          </div>
        ) : (
          <div className="text-center">
            <User className="h-16 w-16 text-zinc-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
              사용자를 선택하세요
            </h2>
            <p className="text-sm text-zinc-400">
              왼쪽 사이드바에서 사용자를 클릭하면 탭으로 등록되고
              <br />
              해당 사용자의 정보를 확인할 수 있습니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
