"use client";

import { useState } from "react";
import {
  useTaskIssues,
  useCreateTaskIssue,
  useDeleteTaskIssue,
  useUpdateTaskIssue,
  useIssueReplies,
  useCreateIssueReply,
  useDeleteIssueReply,
  TaskIssue,
  TaskIssueReply,
} from "@/entities/task";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import {
  Plus,
  Trash2,
  X,
  ChevronDown,
  ChevronRight,
  MessageSquare,
} from "lucide-react";

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

// 이슈 카드 컴포넌트
const IssueCard = ({
  issue,
  onToggleResolved,
  onDelete,
  isUpdating,
  isDeleting,
}: {
  issue: TaskIssue;
  onToggleResolved: (isResolved: boolean) => void;
  onDelete: () => void;
  isUpdating: boolean;
  isDeleting: boolean;
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const [isAddingReply, setIsAddingReply] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  // 항상 답변 개수를 가져옴 (접힌 상태에서도 개수 표시)
  const { data: replies = [] } = useIssueReplies(issue.id);
  const createReplyMutation = useCreateIssueReply(issue.id);
  const deleteReplyMutation = useDeleteIssueReply(issue.id);

  const handleSubmitReply = () => {
    if (!replyContent.trim()) return;
    createReplyMutation.mutate(replyContent.trim(), {
      onSuccess: () => {
        setReplyContent("");
        setIsAddingReply(false);
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitReply();
    }
    if (e.key === "Escape") {
      setIsAddingReply(false);
      setReplyContent("");
    }
  };

  return (
    <div
      className={`p-2 rounded border text-xs ${
        issue.isResolved
          ? "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 opacity-60"
          : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
      }`}
    >
      {/* 이슈 본문 */}
      <div className="flex items-start justify-between gap-2">
        <p
          className={`flex-1 ${
            issue.isResolved ? "line-through text-zinc-500" : ""
          }`}
        >
          {issue.content}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
          onClick={onDelete}
          disabled={isDeleting}
          title="삭제"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* 이슈 메타 정보 + 해결 토글 */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-2 text-zinc-400">
          <span>{issue.user?.name || "익명"}</span>
          <span>•</span>
          <span>{formatTime(issue.createdAt)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`text-xs ${issue.isResolved ? "text-green-600" : "text-zinc-400"}`}
          >
            {issue.isResolved ? "해결" : "미해결"}
          </span>
          <Switch
            checked={issue.isResolved}
            onCheckedChange={onToggleResolved}
            disabled={isUpdating}
            className="scale-75"
          />
        </div>
      </div>

      {/* 답변 토글 버튼 */}
      <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-1 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            {showReplies ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            <MessageSquare className="h-3 w-3" />
            <span>답변 {replies.length > 0 && `(${replies.length})`}</span>
          </button>
          {!isAddingReply && showReplies && (
            <Button
              variant="outline"
              size="sm"
              className="h-5 w-5 p-0"
              onClick={() => setIsAddingReply(true)}
              title="답변 추가"
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* 답변 목록 */}
        {showReplies && replies.length > 0 && (
          <div className="mt-2 ml-3 space-y-2 border-l-2 border-zinc-200 dark:border-zinc-700 pl-2">
            {replies.map((reply: TaskIssueReply) => (
              <div key={reply.id} className="flex items-start gap-2">
                <span className="text-zinc-400">↳</span>
                <div className="flex-1">
                  <p className="text-zinc-700 dark:text-zinc-300">
                    {reply.content}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-zinc-400">
                    <span>{reply.user?.name || "익명"}</span>
                    <span>•</span>
                    <span>{formatTime(reply.createdAt)}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 text-red-500 hover:text-red-600"
                  onClick={() => deleteReplyMutation.mutate(reply.id)}
                  disabled={deleteReplyMutation.isPending}
                  title="삭제"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* 답변 입력 폼 */}
        {showReplies && isAddingReply && (
          <div className="mt-2 ml-3 space-y-1">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="답변을 입력하세요..."
              className="w-full p-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
            <div className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => {
                  setIsAddingReply(false);
                  setReplyContent("");
                }}
              >
                취소
              </Button>
              <Button
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={handleSubmitReply}
                disabled={!replyContent.trim() || createReplyMutation.isPending}
              >
                등록
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const TaskIssueList = ({ taskId }: TaskIssueListProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState("");

  const { data: issues = [], isLoading } = useTaskIssues(taskId);
  const createMutation = useCreateTaskIssue(taskId);
  const deleteMutation = useDeleteTaskIssue(taskId);
  const updateMutation = useUpdateTaskIssue(taskId);

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
            <IssueCard
              key={issue.id}
              issue={issue}
              onToggleResolved={(isResolved) =>
                updateMutation.mutate({
                  issueId: issue.id,
                  data: { isResolved },
                })
              }
              onDelete={() => deleteMutation.mutate(issue.id)}
              isUpdating={updateMutation.isPending}
              isDeleting={deleteMutation.isPending}
            />
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
