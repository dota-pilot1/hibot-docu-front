"use client";

import { TabType } from "./FooterCard";

interface FooterBodyProps {
  isExpanded: boolean;
  activeTab: TabType;
}

export const FooterBody = ({ isExpanded, activeTab }: FooterBodyProps) => {
  if (!isExpanded) return null;

  return (
    <div
      className="bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 transition-all duration-300 overflow-y-auto p-4"
      style={{ height: isExpanded ? "25vh" : "0" }}
    >
      {/* 탭 컨텐츠 */}
      <div className="h-full">
        {activeTab === "notice" && (
          <div className="flex items-center justify-center h-full text-center text-zinc-500 dark:text-zinc-400">
            <div>
              <p className="text-sm">📢 공지사항이 여기 표시됩니다.</p>
              <p className="text-xs mt-2 text-zinc-400 dark:text-zinc-500">
                (2차에서 구현 예정)
              </p>
            </div>
          </div>
        )}

        {activeTab === "task" && (
          <div className="flex items-center justify-center h-full text-center text-zinc-500 dark:text-zinc-400">
            <div>
              <p className="text-sm">
                📌 최근 업무 업데이트가 여기 표시됩니다.
              </p>
              <p className="text-xs mt-2 text-zinc-400 dark:text-zinc-500">
                (2차에서 구현 예정)
              </p>
            </div>
          </div>
        )}

        {activeTab === "favorite" && (
          <div className="flex items-center justify-center h-full text-center text-zinc-500 dark:text-zinc-400">
            <div>
              <p className="text-sm">⭐ 즐겨찾기 항목이 여기 표시됩니다.</p>
              <p className="text-xs mt-2 text-zinc-400 dark:text-zinc-500">
                (2차에서 구현 예정)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
