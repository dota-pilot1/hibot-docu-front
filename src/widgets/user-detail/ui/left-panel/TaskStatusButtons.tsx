"use client";

import { Button } from "@/shared/ui/button";
import { Task } from "@/entities/task";
import { History } from "lucide-react";

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
        variant={currentStatus === "pending" ? "default" : "outline"}
        onClick={(e) => {
          e.stopPropagation();
          onStatusChange(task.id, "pending");
        }}
        className="h-7 px-2 text-xs"
      >
        대기
      </Button>

      {/* 진행 버튼 */}
      <Button
        size="sm"
        variant={currentStatus === "in_progress" ? "default" : "outline"}
        onClick={(e) => {
          e.stopPropagation();
          onStatusChange(task.id, "in_progress");
        }}
        className="h-7 px-2 text-xs"
      >
        진행
      </Button>

      {/* 막힘 버튼 */}
      <Button
        size="sm"
        variant={currentStatus === "blocked" ? "default" : "outline"}
        onClick={(e) => {
          e.stopPropagation();
          onStatusChange(task.id, "blocked");
        }}
        className={`h-7 px-2 text-xs ${
          currentStatus === "blocked" ? "bg-orange-500 hover:bg-orange-600" : ""
        }`}
      >
        막힘
      </Button>

      {/* 리뷰 버튼 */}
      <Button
        size="sm"
        variant={currentStatus === "review" ? "default" : "outline"}
        onClick={(e) => {
          e.stopPropagation();
          onStatusChange(task.id, "review");
        }}
        className="h-7 px-2 text-xs"
      >
        리뷰
      </Button>

      {/* 완료 버튼 */}
      <Button
        size="sm"
        variant={currentStatus === "completed" ? "default" : "outline"}
        onClick={(e) => {
          e.stopPropagation();
          onStatusChange(task.id, "completed");
        }}
        className={`h-7 px-2 text-xs ${
          currentStatus === "completed" ? "bg-green-500 hover:bg-green-600" : ""
        }`}
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
