"use client";

import { TaskGrid } from "./TaskGrid";

interface LeftPanelProps {
  userId: number;
}

export const LeftPanel = ({ userId }: LeftPanelProps) => {
  return (
    <div className="flex flex-col h-full p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Task 목록</h2>
        <button className="px-3 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary/90">
          + 새 Task
        </button>
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-2 mb-4">
        {["전체", "진행중", "대기", "완료", "막힘"].map((filter) => (
          <button
            key={filter}
            className="px-3 py-1 text-xs rounded-full border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {filter}
          </button>
        ))}
      </div>

      {/* AG Grid */}
      <div className="flex-1 min-h-0">
        <TaskGrid userId={userId} />
      </div>
    </div>
  );
};
