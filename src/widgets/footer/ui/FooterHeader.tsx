"use client";

import {
  Pause,
  Play,
  CheckCircle,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { TabType } from "./FooterCard";

interface StatusCounts {
  pending: number;
  inProgress: number;
  completed: number;
  blocked: number;
  delayed: number;
}

interface FooterHeaderProps {
  isExpanded: boolean;
  onToggle: () => void;
  statusCounts: StatusCounts;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const FooterHeader = ({
  isExpanded,
  onToggle,
  statusCounts,
  activeTab,
  onTabChange,
}: FooterHeaderProps) => {
  const tabs = [
    { id: "notice" as const, label: "공지", icon: "📢" },
    { id: "task" as const, label: "업무", icon: "📌" },
    { id: "favorite" as const, label: "즐찾", icon: "⭐" },
  ];

  const handleTabClick = (e: React.MouseEvent, tabId: TabType) => {
    e.stopPropagation(); // 푸터 토글 방지
    onTabChange(tabId);
  };

  return (
    <div
      className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
      onClick={onToggle}
      role="button"
      aria-label="푸터 열기/닫기"
      aria-expanded={isExpanded}
    >
      {/* 왼쪽: 탭 버튼 */}
      <div className="flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={(e) => handleTabClick(e, tab.id)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 오른쪽: 상태 배지 그룹 (업무 탭일 때만) + 토글 버튼 */}
      <div className="flex items-center gap-4">
        {activeTab === "task" && (
          <div className="flex items-center gap-4">
            {/* 대기 */}
            <div className="flex items-center gap-1.5 text-sm">
              <Pause className="w-4 h-4 text-zinc-500" />
              <span className="text-zinc-600 dark:text-zinc-400">대기</span>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                {statusCounts.pending}
              </span>
            </div>

            {/* 진행 */}
            <div className="flex items-center gap-1.5 text-sm">
              <Play className="w-4 h-4 text-blue-500" />
              <span className="text-zinc-600 dark:text-zinc-400">진행</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {statusCounts.inProgress}
              </span>
            </div>

            {/* 막힘 */}
            <div className="flex items-center gap-1.5 text-sm">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="text-zinc-600 dark:text-zinc-400">막힘</span>
              <span className="font-semibold text-orange-600 dark:text-orange-400">
                {statusCounts.blocked}
              </span>
            </div>

            {/* 완료 */}
            <div className="flex items-center gap-1.5 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-zinc-600 dark:text-zinc-400">완료</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {statusCounts.completed}
              </span>
            </div>

            {/* 지연 (있을 경우만) */}
            {statusCounts.delayed > 0 && (
              <div className="flex items-center gap-1.5 text-sm">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-zinc-600 dark:text-zinc-400">지연</span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {statusCounts.delayed}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 토글 버튼 */}
        <div className="flex items-center">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-zinc-500" />
          ) : (
            <ChevronUp className="w-5 h-5 text-zinc-500" />
          )}
        </div>
      </div>
    </div>
  );
};
