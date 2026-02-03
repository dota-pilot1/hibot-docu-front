"use client";

import { useState, useRef, useCallback } from "react";
import { useCreateTask } from "@/entities/task";
import {
  TaskGrid,
  TaskGridRef,
} from "@/widgets/user-detail/ui/left-panel/TaskGrid";
import { DepartmentActivityPanel } from "@/widgets/task-all/DepartmentActivityPanel";
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
    <div className="flex h-full gap-4 p-4">
      {/* 왼쪽: 테이블 영역 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 상단 툴바 */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold">전체 업무 목록</h1>

          <div className="flex items-center gap-3">
            {/* 필터 */}
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

            {/* 액션 버튼들 */}
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  createTaskMutation.mutate({ title: "새 Task", assigneeId: 1 })
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

      {/* 오른쪽: 팀별 히스토리 패널 */}
      <DepartmentActivityPanel className="w-80 shrink-0" />
    </div>
  );
}
