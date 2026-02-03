"use client";

import { useMemo } from "react";
import {
  Task,
  TaskStatus,
  taskStatusConfig,
  taskPriorityConfig,
} from "@/entities/task";
import { cn } from "@/shared/lib/utils";
import { format, differenceInDays } from "date-fns";
import { ko } from "date-fns/locale";

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onStatusChange?: (taskId: number, newStatus: TaskStatus) => void;
}

const columns: { status: TaskStatus; label: string; color: string }[] = [
  { status: "pending", label: "대기", color: "border-yellow-400" },
  { status: "in_progress", label: "진행중", color: "border-green-400" },
  { status: "review", label: "리뷰중", color: "border-blue-400" },
  { status: "blocked", label: "막힘", color: "border-red-400" },
  { status: "completed", label: "완료", color: "border-gray-400" },
];

export const KanbanBoard = ({
  tasks,
  onTaskClick,
  onStatusChange,
}: KanbanBoardProps) => {
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      pending: [],
      in_progress: [],
      review: [],
      blocked: [],
      completed: [],
    };
    tasks.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });
    return grouped;
  }, [tasks]);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData("taskId", task.id.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData("taskId"), 10);
    if (taskId && onStatusChange) {
      onStatusChange(taskId, status);
    }
  };

  return (
    <div className="flex gap-4 h-full overflow-x-auto p-4">
      {columns.map((column) => (
        <div
          key={column.status}
          className={cn(
            "flex flex-col w-72 min-w-72 bg-zinc-50 dark:bg-zinc-900 rounded-lg border-t-4",
            column.color
          )}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.status)}
        >
          {/* 컬럼 헤더 */}
          <div className="flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-700">
            <span className="font-medium text-sm">{column.label}</span>
            <span className="text-xs text-zinc-500 bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 rounded-full">
              {tasksByStatus[column.status].length}
            </span>
          </div>

          {/* 카드 목록 */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {tasksByStatus[column.status].map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick?.(task)}
                onDragStart={(e) => handleDragStart(e, task)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

interface KanbanCardProps {
  task: Task;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
}

const KanbanCard = ({ task, onClick, onDragStart }: KanbanCardProps) => {
  const priorityConfig = taskPriorityConfig[task.priority];

  const dDay = useMemo(() => {
    if (!task.dueDate) return null;
    const days = differenceInDays(new Date(task.dueDate), new Date());
    if (days < 0) return { text: `${Math.abs(days)}일 초과`, isOverdue: true };
    if (days === 0) return { text: "오늘 마감", isOverdue: false };
    return { text: `D-${days}`, isOverdue: false };
  }, [task.dueDate]);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-3 cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* 제목 */}
      <h4 className="font-medium text-sm mb-2 line-clamp-2">{task.title}</h4>

      {/* 메타 정보 */}
      <div className="flex items-center justify-between text-xs">
        {/* 우선순위 */}
        <span className={cn("flex items-center gap-1", priorityConfig.color)}>
          <span>{priorityConfig.icon}</span>
          {priorityConfig.label}
        </span>

        {/* D-Day */}
        {dDay && (
          <span
            className={cn(
              "px-1.5 py-0.5 rounded",
              dDay.isOverdue
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            )}
          >
            {dDay.text}
          </span>
        )}
      </div>

      {/* 기한 */}
      {task.dueDate && (
        <div className="mt-2 text-xs text-zinc-500">
          기한: {format(new Date(task.dueDate), "M.d (EEE)", { locale: ko })}
        </div>
      )}

      {/* 이슈 카운트 */}
      {task.issueCount && task.issueCount > 0 && (
        <div className="mt-2 text-xs text-orange-600">
          이슈 {task.issueCount}개
        </div>
      )}
    </div>
  );
};
