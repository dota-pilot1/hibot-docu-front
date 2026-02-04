"use client";

import { Button } from "@/shared/ui/button";
import { Task } from "@/entities/task";
import { History } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface TaskStatusButtonsProps {
  task: Task;
  onStatusChange: (
    taskId: number,
    status: "pending" | "in_progress" | "blocked" | "review" | "completed",
  ) => void;
  onHistoryClick: (taskId: number) => void;
}

export const TaskStatusButtons = ({
  task,
  onStatusChange,
  onHistoryClick,
}: TaskStatusButtonsProps) => {
  const currentStatus = task.status;

  return (
    <div className="flex items-center gap-1">
      {/* 대기 버튼 */}
      <Button
        size="sm"
        variant="outline"
        onClick={(e) => {
          e.stopPropagation();
          onStatusChange(task.id, "pending");
        }}
        className={cn(
          "h-7 px-2 text-xs",
          currentStatus === "pending" &&
            "bg-slate-100 border-slate-300 text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100",
        )}
      >
        대기
      </Button>

      {/* 진행 버튼 */}
      <Button
        size="sm"
        variant="outline"
        onClick={(e) => {
          e.stopPropagation();
          onStatusChange(task.id, "in_progress");
        }}
        className={cn(
          "h-7 px-2 text-xs",
          currentStatus === "in_progress" &&
            "bg-blue-50 border-blue-300 text-blue-900 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-100",
        )}
      >
        진행
      </Button>

      {/* 막힘 버튼 */}
      <Button
        size="sm"
        variant="outline"
        onClick={(e) => {
          e.stopPropagation();
          onStatusChange(task.id, "blocked");
        }}
        className={cn(
          "h-7 px-2 text-xs",
          currentStatus === "blocked" &&
            "bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950 dark:border-amber-700 dark:text-amber-100",
        )}
      >
        막힘
      </Button>

      {/* 리뷰 버튼 */}
      <Button
        size="sm"
        variant="outline"
        onClick={(e) => {
          e.stopPropagation();
          onStatusChange(task.id, "review");
        }}
        className={cn(
          "h-7 px-2 text-xs",
          currentStatus === "review" &&
            "bg-purple-50 border-purple-300 text-purple-900 dark:bg-purple-950 dark:border-purple-700 dark:text-purple-100",
        )}
      >
        리뷰
      </Button>

      {/* 완료 버튼 */}
      <Button
        size="sm"
        variant="outline"
        onClick={(e) => {
          e.stopPropagation();
          onStatusChange(task.id, "completed");
        }}
        className={cn(
          "h-7 px-2 text-xs",
          currentStatus === "completed" &&
            "bg-green-50 border-green-300 text-green-900 dark:bg-green-950 dark:border-green-700 dark:text-green-100",
        )}
      >
        완료
      </Button>

      {/* 내역 버튼 - 모든 상태에서 활성화 */}
      <Button
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          onHistoryClick(task.id);
        }}
        className="h-7 px-2 text-xs"
        title="상태별 내역"
      >
        <History className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};
