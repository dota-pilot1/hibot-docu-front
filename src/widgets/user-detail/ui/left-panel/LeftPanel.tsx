"use client";

import { useState, useRef, useCallback } from "react";
import { Task, useCreateTask, useSetCurrentTask } from "@/entities/task";
import { TaskGrid, TaskGridRef } from "./TaskGrid";
import { Button } from "@/shared/ui/button";
import { Plus, Save, Trash2, Check } from "lucide-react";

interface LeftPanelProps {
  userId: number;
  currentTask?: Task | null;
}

export const LeftPanel = ({ userId, currentTask }: LeftPanelProps) => {
  const [filter, setFilter] = useState<string>("all");
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedCount, setSelectedCount] = useState(0);
  const gridRef = useRef<TaskGridRef>(null);

  const createTaskMutation = useCreateTask();
  const setCurrentTaskMutation = useSetCurrentTask(userId);

  const filters = [
    { key: "all", label: "전체" },
    { key: "in_progress", label: "진행중" },
    { key: "pending", label: "대기" },
    { key: "completed", label: "완료" },
  ];

  const handleSave = async () => {
    await gridRef.current?.saveChanges();
  };

  const handleDelete = async () => {
    await gridRef.current?.deleteSelected();
  };

  const handleSelectCurrentTask = () => {
    const selectedTask = gridRef.current?.getSelectedTask();
    if (selectedTask) {
      setCurrentTaskMutation.mutate(selectedTask.id);
    }
  };

  const handlePendingChange = useCallback((count: number) => {
    setPendingCount(count);
  }, []);

  const handleSelectionChange = useCallback((count: number) => {
    setSelectedCount(count);
  }, []);

  return (
    <div className="flex flex-col h-full p-4">
      {/* 상단 툴바: 필터 + 버튼들 한 줄 */}
      <div className="flex items-center justify-between mb-3">
        {/* 왼쪽: 필터 탭 */}
        <div className="flex gap-1">
          {filters.map((f) => (
            <Button
              key={f.key}
              onClick={() => setFilter(f.key)}
              variant={filter === f.key ? "default" : "outline"}
              size="sm"
              className="rounded-full"
            >
              {f.label}
            </Button>
          ))}
        </div>

        {/* 오른쪽: 액션 버튼들 */}
        <div className="flex items-center gap-1">
          {selectedCount === 1 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleSelectCurrentTask}
              className="border-green-500 text-green-600 hover:bg-green-50 dark:border-green-600 dark:text-green-500 dark:hover:bg-green-950/30"
            >
              <Check className="h-4 w-4" />
              <span className="ml-1">선택</span>
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              createTaskMutation.mutate({
                title: "새 Task",
                assigneeId: userId,
              })
            }
            disabled={createTaskMutation.isPending}
            title="새 Task 추가"
          >
            <Plus className="h-4 w-4" />
            <span className="ml-1">추가</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            disabled={selectedCount === 0}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
            title="선택 항목 삭제"
          >
            <Trash2 className="h-4 w-4" />
            <span className="ml-1">삭제</span>
          </Button>
          <Button
            size="sm"
            variant={pendingCount > 0 ? "default" : "ghost"}
            onClick={handleSave}
            disabled={pendingCount === 0}
          >
            <Save className="h-4 w-4" />
            <span className="ml-1">
              저장{pendingCount > 0 && ` (${pendingCount})`}
            </span>
          </Button>
        </div>
      </div>

      {/* AG Grid */}
      <div className="flex-1 min-h-0">
        <TaskGrid
          ref={gridRef}
          userId={userId}
          filter={filter}
          currentTaskId={currentTask?.id}
          onPendingChange={handlePendingChange}
          onSelectionChange={handleSelectionChange}
        />
      </div>
    </div>
  );
};
