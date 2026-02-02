"use client";

import { Task, taskStatusConfig } from "@/entities/task";
import { TaskDetailSection } from "@/widgets/user-detail/ui/right-panel/task-detail/TaskDetailSection";

interface IssueTaskCardProps {
  task: Task | null;
}

export const IssueTaskCard = ({ task }: IssueTaskCardProps) => {
  if (!task) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-zinc-400">📋</span>
          <h3 className="font-semibold text-sm">선택된 업무</h3>
        </div>
        <p className="text-xs text-zinc-500">좌측에서 업무를 선택하세요</p>
      </div>
    );
  }

  const statusConfig = taskStatusConfig[task.status];

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-blue-500">📋</span>
        <h3 className="font-semibold text-sm">선택된 업무</h3>
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

      {/* 업무 상세 섹션 */}
      <TaskDetailSection taskId={task.id} />
    </div>
  );
};
