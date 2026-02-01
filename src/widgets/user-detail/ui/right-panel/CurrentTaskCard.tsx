"use client";

import { taskStatusConfig } from "@/entities/task";

export const CurrentTaskCard = () => {
  // 더미 데이터 - 현재 작업
  const currentTask = {
    id: 1,
    title: "API 엔드포인트 개발",
    status: "in_progress" as const,
    elapsedTime: "02:34:15",
  };

  const statusConfig = taskStatusConfig[currentTask.status];

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-orange-500">🔥</span>
        <h3 className="font-semibold text-sm">현재 작업</h3>
      </div>

      <div className="bg-zinc-50 dark:bg-zinc-900 rounded-md p-3">
        <p className="font-medium text-sm mb-2">{currentTask.title}</p>

        <div className="flex items-center justify-between">
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${statusConfig.bgColor} ${statusConfig.color}`}
          >
            {statusConfig.label}
          </span>
          <span className="text-xs text-zinc-500 font-mono">
            ⏱️ {currentTask.elapsedTime}
          </span>
        </div>
      </div>

      {/* 상태 변경 버튼 */}
      <div className="flex gap-2 mt-3">
        {(["in_progress", "blocked", "review"] as const).map((status) => {
          const config = taskStatusConfig[status];
          const isActive = currentTask.status === status;
          return (
            <button
              key={status}
              className={`flex-1 px-2 py-1 text-xs rounded-md border transition-colors ${
                isActive
                  ? `${config.bgColor} ${config.color} border-transparent`
                  : "border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700"
              }`}
            >
              {config.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
