"use client";

import { useState } from "react";
import {
  useTaskIssues,
  useCreateTaskIssue,
  useDeleteTaskIssue,
  useResolveTaskIssue,
  TaskIssue,
} from "@/entities/task";
import { Button } from "@/shared/ui/button";
import { Plus, Check, Trash2, X } from "lucide-react";

interface TaskIssueListProps {
  taskId: number | null;
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const TaskIssueList = ({ taskId }: TaskIssueListProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState("");

  const { data: issues = [], isLoading } = useTaskIssues(taskId);
  const createMutation = useCreateTaskIssue(taskId);
  const deleteMutation = useDeleteTaskIssue(taskId);
  const resolveMutation = useResolveTaskIssue(taskId);

  const handleSubmit = () => {
    if (!newContent.trim()) return;
    createMutation.mutate(newContent.trim(), {
      onSuccess: () => {
        setNewContent("");
        setIsAdding(false);
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      setIsAdding(false);
      setNewContent("");
    }
  };

  if (!taskId) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <span>💬</span> 이슈 내역
        </h3>
        <p className="text-xs text-zinc-500">현재 작업을 선택해주세요</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <span>💬</span> 이슈 내역
          {issues.length > 0 && (
            <span className="text-xs text-zinc-500">({issues.length})</span>
          )}
        </h3>
        {!isAdding && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* 이슈 목록 */}
      {isLoading ? (
        <p className="text-xs text-zinc-500">로딩 중...</p>
      ) : issues.length === 0 && !isAdding ? (
        <p className="text-xs text-zinc-500">등록된 이슈가 없습니다</p>
      ) : (
        <div className="space-y-2">
          {issues.map((issue: TaskIssue) => (
            <div
              key={issue.id}
              className={`p-2 rounded border text-xs ${
                issue.isResolved
                  ? "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 opacity-60"
                  : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p
                  className={`flex-1 ${
                    issue.isResolved ? "line-through text-zinc-500" : ""
                  }`}
                >
                  {issue.content}
                </p>
                <div className="flex items-center gap-1 shrink-0">
                  {!issue.isResolved && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => resolveMutation.mutate(issue.id)}
                      disabled={resolveMutation.isPending}
                      title="해결"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => deleteMutation.mutate(issue.id)}
                    disabled={deleteMutation.isPending}
                    title="삭제"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1 text-zinc-400">
                <span>{issue.user?.name || "익명"}</span>
                <span>•</span>
                <span>{formatTime(issue.createdAt)}</span>
                {issue.isResolved && (
                  <>
                    <span>•</span>
                    <span className="text-green-600">해결됨</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 이슈 입력 폼 */}
      {isAdding && (
        <div className="mt-3 space-y-2">
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="이슈 내용을 입력하세요..."
            className="w-full p-2 text-xs border rounded resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            rows={2}
            autoFocus
          />
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => {
                setIsAdding(false);
                setNewContent("");
              }}
            >
              <X className="h-3 w-3 mr-1" />
              취소
            </Button>
            <Button
              size="sm"
              className="h-7 px-2"
              onClick={handleSubmit}
              disabled={!newContent.trim() || createMutation.isPending}
            >
              <Plus className="h-3 w-3 mr-1" />
              등록
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
