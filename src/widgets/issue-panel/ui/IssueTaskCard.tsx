"use client";

import { useState } from "react";
import {
  Task,
  TaskStatus,
  taskStatusConfig,
  useUpdateTaskStatus,
} from "@/entities/task";
import { TaskDetailSection } from "@/widgets/user-detail/ui/right-panel/task-detail/TaskDetailSection";

interface IssueTaskCardProps {
  task: Task | null;
}

export const IssueTaskCard = ({ task }: IssueTaskCardProps) => {
  const updateStatusMutation = useUpdateTaskStatus(task?.assigneeId);

  if (!task) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-zinc-400">📋</span>
          <h3 className="font-semibold text-sm">현재 작업</h3>
        </div>
        <p className="text-xs text-zinc-500">좌측에서 이슈를 선택하세요</p>
      </div>
    );
  }

  const statusConfig = taskStatusConfig[task.status];

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (task.assigneeId) {
      updateStatusMutation.mutate({ id: task.id, status: newStatus });
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-orange-500">🔥</span>
        <h3 className="font-semibold text-sm">현재 작업</h3>
      </div>

      <div className="bg-zinc-50 dark:bg-zinc-900 rounded-md p-3">
        <p className="font-medium text-sm mb-2">{task.title}</p>

        <div className="flex items-center justify-between">
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${statusConfig.bgColor} ${statusConfig.color}`}
          >
            {statusConfig.label}
          </span>
          {task.dueDate && (
            <span className="text-xs text-zinc-500">
              기한: {new Date(task.dueDate).toLocaleDateString("ko-KR")}
            </span>
          )}
        </div>
      </div>

      {/* 상태 변경 버튼 */}
      <div className="flex gap-2 mt-3">
        {(["in_progress", "blocked", "review", "completed"] as const).map(
          (status) => {
            const config = taskStatusConfig[status];
            const isActive = task.status === status;
            return (
              <button
                key={status}
                onClick={() => !isActive && handleStatusChange(status)}
                disabled={updateStatusMutation.isPending || !task.assigneeId}
                className={`flex-1 px-2 py-1 text-xs rounded-md border-2 transition-colors ${
                  isActive
                    ? `${config.bgColor} ${config.color} border-current font-semibold`
                    : "border-zinc-200 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                } disabled:opacity-50`}
              >
                {config.label}
              </button>
            );
          },
        )}
      </div>

      {/* 업무 상세 섹션 */}
      <TaskDetailSection taskId={task.id} />
    </div>
  );
};
