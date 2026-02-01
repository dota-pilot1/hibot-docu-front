"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Task, taskApi } from "@/entities/task";
import { TaskGrid } from "./TaskGrid";

interface LeftPanelProps {
  userId: number;
  onTaskSelect?: (task: Task | null) => void;
}

export const LeftPanel = ({ userId, onTaskSelect }: LeftPanelProps) => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("all");

  const createTaskMutation = useMutation({
    mutationFn: () =>
      taskApi.create({
        title: "새 Task",
        assigneeId: userId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", "user", userId] });
    },
  });

  const filters = [
    { key: "all", label: "전체" },
    { key: "in_progress", label: "진행중" },
    { key: "pending", label: "대기" },
    { key: "completed", label: "완료" },
  ];

  return (
    <div className="flex flex-col h-full p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Task 목록</h2>
        <button
          onClick={() => createTaskMutation.mutate()}
          disabled={createTaskMutation.isPending}
          className="px-3 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          + 새 Task
        </button>
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-2 mb-4">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              filter === f.key
                ? "bg-primary text-white border-primary"
                : "border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* AG Grid */}
      <div className="flex-1 min-h-0">
        <TaskGrid userId={userId} onTaskSelect={onTaskSelect} />
      </div>
    </div>
  );
};
