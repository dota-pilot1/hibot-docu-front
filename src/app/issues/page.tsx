"use client";

import { Suspense, useState, useRef, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Task,
  TaskStatus,
  useCreateTask,
  useAllTasks,
  useUpdateTaskStatus,
} from "@/entities/task";
import {
  TaskGrid,
  TaskGridRef,
} from "@/widgets/user-detail/ui/left-panel/TaskGrid";
import { TaskIssueDialog } from "@/widgets/user-detail/ui/right-panel/TaskIssueDialog";
import { TaskDetailDialog } from "@/widgets/user-detail/ui/TaskDetailDialog";
import { Button } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { Plus, Save, Trash2 } from "lucide-react";
import {
  ViewToggle,
  ViewType,
  KanbanBoard,
  GanttChart,
} from "@/widgets/issue-views";

function IssuesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL에서 뷰 타입 읽기
  const viewParam = searchParams.get("view") as ViewType | null;
  const view: ViewType = viewParam || "table";

  const [filter, setFilter] = useState<string>("all");
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedCount, setSelectedCount] = useState(0);
  const [issueDialogTask, setIssueDialogTask] = useState<Task | null>(null);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const gridRef = useRef<TaskGridRef>(null);

  const createTaskMutation = useCreateTask();
  const { data: allTasks = [] } = useAllTasks();
  const updateStatusMutation = useUpdateTaskStatus();

  // 필터링된 태스크
  const filteredTasks = useMemo(() => {
    if (filter === "all") return allTasks;
    return allTasks.filter((task) => task.status === filter);
  }, [allTasks, filter]);

  const filters = [
    { key: "all", label: "전체" },
    { key: "in_progress", label: "진행중" },
    { key: "pending", label: "대기" },
    { key: "blocked", label: "막힘" },
    { key: "review", label: "리뷰" },
    { key: "completed", label: "완료" },
  ];

  const handleViewChange = (newView: ViewType) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newView === "table") {
      params.delete("view");
    } else {
      params.set("view", newView);
    }
    router.push(`/issues?${params.toString()}`);
  };

  const handleSave = async () => {
    await gridRef.current?.saveChanges();
  };

  const handleDeleteClick = () => {
    if (selectedCount > 0) {
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await gridRef.current?.deleteSelected();
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handlePendingChange = useCallback((count: number) => {
    setPendingCount(count);
  }, []);

  const handleSelectionChange = useCallback((count: number) => {
    setSelectedCount(count);
  }, []);

  const handleIssueClick = useCallback((task: Task) => {
    setIssueDialogTask(task);
    setIssueDialogOpen(true);
  }, []);

  const handleDetailClick = useCallback((task: Task) => {
    setDetailTask(task);
    setDetailDialogOpen(true);
  }, []);

  const handleTaskClick = useCallback((task: Task) => {
    setDetailTask(task);
    setDetailDialogOpen(true);
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
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">업무 관리</h1>

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

          {/* 뷰 전환 */}
          <ViewToggle view={view} onViewChange={handleViewChange} />
        </div>

        {/* 오른쪽: 액션 버튼 */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              createTaskMutation.mutate({
                title: "새 업무",
              })
            }
            disabled={createTaskMutation.isPending}
            className="h-8 w-8 p-0"
            title="새 업무 추가"
          >
            <Plus className="h-4 w-4" />
          </Button>
          {view === "table" && (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex-1 min-h-0">
        {view === "table" && (
          <TaskGrid
            ref={gridRef}
            filter={filter}
            showAssignee={true}
            showIssueColumn={true}
            showDetailColumn={true}
            onPendingChange={handlePendingChange}
            onSelectionChange={handleSelectionChange}
            onIssueClick={handleIssueClick}
            onDetailClick={handleDetailClick}
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

      {/* 이슈 다이얼로그 */}
      <TaskIssueDialog
        task={issueDialogTask}
        open={issueDialogOpen}
        onOpenChange={setIssueDialogOpen}
      />

      {/* 업무 상세 다이얼로그 */}
      <TaskDetailDialog
        task={detailTask}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="업무 삭제"
        description={`선택한 ${selectedCount}개의 업무를 삭제하시겠습니까?`}
        confirmLabel="삭제"
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  );
}

export default function IssuesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <div className="text-zinc-500">로딩중...</div>
        </div>
      }
    >
      <IssuesContent />
    </Suspense>
  );
}
