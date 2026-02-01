"use client";

import { useState, useRef, useCallback } from "react";
import { useCreateTask } from "@/entities/task";
import {
  TaskGrid,
  TaskGridRef,
} from "@/widgets/user-detail/ui/left-panel/TaskGrid";
import { Button } from "@/shared/ui/button";
import { Plus, Save, Trash2 } from "lucide-react";

export default function AllTasksPage() {
  const [filter, setFilter] = useState<string>("all");
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedCount, setSelectedCount] = useState(0);
  const gridRef = useRef<TaskGridRef>(null);

  const createTaskMutation = useCreateTask();

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

  const handlePendingChange = useCallback((count: number) => {
    setPendingCount(count);
  }, []);

  const handleSelectionChange = useCallback((count: number) => {
    setSelectedCount(count);
  }, []);

  return (
    <div className="flex flex-col h-full p-4">
      {/* 상단 툴바 */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg font-semibold">전체 업무 목록</h1>

        <div className="flex items-center gap-3">
          {/* 필터 */}
          <div className="flex gap-1">
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

          {/* 액션 버튼들 */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                createTaskMutation.mutate({ title: "새 Task", assigneeId: 1 })
              }
              disabled={createTaskMutation.isPending}
              className="h-8 w-8 p-0"
              title="새 Task 추가"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              disabled={selectedCount === 0}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              title="선택 항목 삭제"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={pendingCount === 0}
              className={`h-8 px-3 ${pendingCount > 0 ? "bg-blue-600 hover:bg-blue-700" : ""}`}
            >
              <Save className="h-4 w-4 mr-1" />
              저장{pendingCount > 0 && ` (${pendingCount})`}
            </Button>
          </div>
        </div>
      </div>

      {/* AG Grid */}
      <div className="flex-1 min-h-0">
        <TaskGrid
          ref={gridRef}
          filter={filter}
          showAssignee={true}
          onPendingChange={handlePendingChange}
          onSelectionChange={handleSelectionChange}
        />
      </div>
    </div>
  );
}
