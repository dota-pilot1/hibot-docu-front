"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Task,
  TaskStatus,
  taskApi,
  useCreateTask,
  useSetCurrentTask,
  useUpdateTaskStatus,
} from "@/entities/task";
import { TaskGrid, TaskGridRef } from "./left-panel/TaskGrid";
import { TaskDetailDialog } from "./TaskDetailDialog";
import { TaskIssueDialog } from "./right-panel/TaskIssueDialog";
import { Button } from "@/shared/ui/button";
import { Plus, Save, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import {
  ViewToggle,
  ViewType,
  KanbanBoard,
  GanttChart,
} from "@/widgets/issue-views";

interface UserDetailLayoutProps {
  userId: number;
  userName: string;
}

export const UserDetailLayout = ({
  userId,
  userName,
}: UserDetailLayoutProps) => {
  const [view, setView] = useState<ViewType>("table");
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

  // 유저별 Task 조회
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", "user", userId],
    queryFn: () => taskApi.getByUser(userId),
  });

  // 현재 작업을 서버에서 조회
  const { data: currentTask = null } = useQuery({
    queryKey: ["tasks", "current", userId],
    queryFn: () => taskApi.getCurrentTask(userId),
  });

  const createTaskMutation = useCreateTask();
  const setCurrentTaskMutation = useSetCurrentTask(userId);
  const updateStatusMutation = useUpdateTaskStatus();

  // 필터링된 Task
  const filteredTasks = useMemo(() => {
    if (filter === "all") return tasks;
    return tasks.filter((task) => task.status === filter);
  }, [tasks, filter]);

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

  const handleTaskClick = useCallback((task: Task) => {
    setDetailTask(task);
    setIsDetailOpen(true);
  }, []);

  const handleStatusChange = useCallback(
    (taskId: number, newStatus: TaskStatus) => {
      updateStatusMutation.mutate({ id: taskId, status: newStatus });
    },
    [updateStatusMutation],
  );

  return (
    <div className="flex flex-col h-full w-full p-4">
      {/* 상단 툴바 */}
      <div className="flex items-center justify-between mb-3">
        {/* 필터 탭 + 뷰 전환 */}
        <div className="flex items-center gap-4">
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

          <ViewToggle view={view} onViewChange={setView} />
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
            title="새 Task 추가"
          >
            <Plus className="h-4 w-4" />
            <span className="ml-1">추가</span>
          </Button>
          {view === "table" && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDeleteClick}
                disabled={selectedCount === 0}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
                title="선택 항목 삭제"
              >
                <Trash2 className="h-4 w-4" />
                <span className="ml-1">삭제</span>
              </Button>
              <Button
                size="sm"
                variant={selectedCount > 0 ? "default" : "ghost"}
                onClick={handleSave}
                disabled={selectedCount === 0}
              >
                <Save className="h-4 w-4" />
                <span className="ml-1">
                  저장{selectedCount > 0 && ` (${selectedCount})`}
                </span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex-1 min-h-0">
        {view === "table" && (
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
        )}

        {view === "kanban" && (
          <KanbanBoard
            tasks={filteredTasks}
            onTaskClick={handleTaskClick}
            onStatusChange={handleStatusChange}
          />
        )}

        {view === "gantt" && (
          <GanttChart tasks={filteredTasks} onTaskClick={handleTaskClick} />
        )}
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
