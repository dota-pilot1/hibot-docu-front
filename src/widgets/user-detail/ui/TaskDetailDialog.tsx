"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  Task,
  TaskStatus,
  taskStatusConfig,
  useUpdateTaskStatus,
} from "@/entities/task";
import { TaskDetailSection } from "./right-panel/task-detail/TaskDetailSection";

interface TaskDetailDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
}: TaskDetailDialogProps) {
  const updateStatusMutation = useUpdateTaskStatus(task?.assigneeId);

  if (!task) return null;

  const statusConfig = taskStatusConfig[task.status];

  const handleStatusChange = (newStatus: TaskStatus) => {
    updateStatusMutation.mutate({ id: task.id, status: newStatus });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg">{task.title}</DialogTitle>
        </DialogHeader>

        {/* 상태 및 기한 */}
        <div className="flex items-center justify-between py-2 border-b">
          <div className="flex items-center gap-4">
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${statusConfig.bgColor} ${statusConfig.color}`}
            >
              {statusConfig.label}
            </span>
            {task.dueDate && (
              <span className="text-sm text-zinc-500">
                기한: {new Date(task.dueDate).toLocaleDateString("ko-KR")}
              </span>
            )}
          </div>
        </div>

        {/* 상태 변경 버튼 */}
        <div className="flex gap-2 py-2">
          {(["in_progress", "blocked", "review", "completed"] as const).map(
            (status) => {
              const config = taskStatusConfig[status];
              const isActive = task.status === status;
              return (
                <button
                  key={status}
                  onClick={() => !isActive && handleStatusChange(status)}
                  disabled={updateStatusMutation.isPending}
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

        {/* 스크롤 가능한 컨텐츠 영역 */}
        <div className="flex-1 overflow-y-auto pr-2">
          <TaskDetailSection
            taskId={task.id}
            startedAt={task.startedAt}
            dueDate={task.dueDate}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
