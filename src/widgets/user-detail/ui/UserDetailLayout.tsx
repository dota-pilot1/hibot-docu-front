"use client";

import { useState, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Task,
  taskApi,
  useCreateTask,
  useSetCurrentTask,
} from "@/entities/task";
import { TaskGrid, TaskGridRef } from "./left-panel/TaskGrid";
import { TaskDetailDialog } from "./TaskDetailDialog";
import { TaskIssueDialog } from "./right-panel/TaskIssueDialog";
import { Button } from "@/shared/ui/button";
import { Plus, Save, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";

interface UserDetailLayoutProps {
  userId: number;
  userName: string;
}

export const UserDetailLayout = ({
  userId,
  userName,
}: UserDetailLayoutProps) => {
  const [filter, setFilter] = useState<string>("all");
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedCount, setSelectedCount] = useState(0);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [issueTask, setIssueTask] = useState<Task | null>(null);
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const gridRef = useRef<TaskGridRef>(null);

  // 현재 작업을 서버에서 조회
  const { data: currentTask = null } = useQuery({
    queryKey: ["tasks", "current", userId],
    queryFn: () => taskApi.getCurrentTask(userId),
  });

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

  const handleDeleteClick = () => {
    if (selectedCount > 0) {
      setIsDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    await gridRef.current?.deleteSelected();
    setIsDeleteDialogOpen(false);
  };

  const handleCurrentTaskChange = useCallback(
    (taskId: number) => {
      setCurrentTaskMutation.mutate(taskId);
    },
    [setCurrentTaskMutation],
  );

  const handlePendingChange = useCallback((count: number) => {
    setPendingCount(count);
  }, []);

  const handleSelectionChange = useCallback((count: number) => {
    setSelectedCount(count);
  }, []);

  const handleDetailClick = useCallback((task: Task) => {
    setDetailTask(task);
    setIsDetailOpen(true);
  }, []);

  const handleIssueClick = useCallback((task: Task) => {
    setIssueTask(task);
    setIsIssueOpen(true);
  }, []);

  return (
    <div className="flex flex-col h-full w-full p-4">
      {/* 상단 툴바 */}
      <div className="flex items-center justify-between mb-3">
        {/* 필터 탭 */}
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
              createTaskMutation.mutate({
                title: "새 Task",
                assigneeId: userId,
              })
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
            onClick={handleDeleteClick}
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

      {/* AG Grid - 전체 공간 사용 */}
      <div className="flex-1 min-h-0">
        <TaskGrid
          ref={gridRef}
          userId={userId}
          filter={filter}
          currentTaskId={currentTask?.id}
          showIssueColumn={true}
          showDetailColumn={true}
          showCurrentTaskColumn={true}
          onPendingChange={handlePendingChange}
          onSelectionChange={handleSelectionChange}
          onIssueClick={handleIssueClick}
          onDetailClick={handleDetailClick}
          onCurrentTaskChange={handleCurrentTaskChange}
        />
      </div>

      {/* 업무 상세 다이얼로그 */}
      <TaskDetailDialog
        task={detailTask}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />

      {/* 이슈 다이얼로그 */}
      <TaskIssueDialog
        task={issueTask}
        open={isIssueOpen}
        onOpenChange={setIsIssueOpen}
      />

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Task 삭제"
        description={`선택한 ${selectedCount}개의 Task를 삭제하시겠습니까?`}
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />
    </div>
  );
};
