"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskReviewApi } from "@/entities/task";
import { BaseDialog } from "@/shared/ui/dialogs/BaseDialog";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Badge } from "@/shared/ui/badge";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { useUserStore } from "@/entities/user/model/store";
import { TaskStatus } from "@/entities/task";

interface TaskReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: number;
  taskTitle: string;
  currentStatus: TaskStatus;
}

const statusLabels: Record<TaskStatus, string> = {
  pending: "대기",
  in_progress: "진행중",
  blocked: "막힘",
  review: "리뷰중",
  completed: "완료",
};

const statusColors: Record<TaskStatus, { badgeClass: string }> = {
  pending: {
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  },
  in_progress: {
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
  },
  blocked: {
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
  },
  review: {
    badgeClass: "bg-purple-100 text-purple-700 border-purple-200",
  },
  completed: {
    badgeClass: "bg-green-100 text-green-700 border-green-200",
  },
};

export const TaskReviewDialog = ({
  open,
  onOpenChange,
  taskId,
  taskTitle,
  currentStatus,
}: TaskReviewDialogProps) => {
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newContent, setNewContent] = useState("");
  const [editContent, setEditContent] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<TaskStatus>(currentStatus);

  // 리뷰 목록 조회
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["taskReviews", taskId],
    queryFn: () => taskReviewApi.getByTaskId(taskId),
    enabled: open,
  });

  // 선택된 상태의 리뷰만 필터링
  const filteredReviews = reviews.filter(
    (review) => review.status === selectedStatus,
  );

  // 리뷰 생성 mutation
  const createMutation = useMutation({
    mutationFn: (content: string) =>
      taskReviewApi.create(taskId, {
        status: selectedStatus,
        content,
        createdBy: user?.userId || 0,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskReviews", taskId] });
      setNewContent("");
      setIsAdding(false);
      toast.success("내역이 추가되었습니다");
    },
    onError: () => {
      toast.error("내역 추가에 실패했습니다");
    },
  });

  // 리뷰 수정 mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) =>
      taskReviewApi.update(taskId, id, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskReviews", taskId] });
      setEditingId(null);
      setEditContent("");
      toast.success("내역이 수정되었습니다");
    },
    onError: () => {
      toast.error("내역 수정에 실패했습니다");
    },
  });

  // 리뷰 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => taskReviewApi.delete(taskId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskReviews", taskId] });
      toast.success("내역이 삭제되었습니다");
    },
    onError: () => {
      toast.error("내역 삭제에 실패했습니다");
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) {
      toast.error("내용을 입력해주세요");
      return;
    }
    createMutation.mutate(newContent);
  };

  const handleEditSubmit = (id: number) => {
    if (!editContent.trim()) {
      toast.error("내용을 입력해주세요");
      return;
    }
    updateMutation.mutate({ id, content: editContent });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title="업무 상태별 내역"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        {/* 업무 제목 */}
        <div className="pb-2 border-b">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            업무:{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {taskTitle}
            </span>
          </p>
        </div>

        {/* 상태 탭 */}
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(statusLabels) as Array<keyof typeof statusLabels>).map(
            (status) => {
              const statusReviews = reviews.filter((r) => r.status === status);
              return (
                <Button
                  key={status}
                  size="sm"
                  variant={selectedStatus === status ? "default" : "outline"}
                  onClick={() => setSelectedStatus(status)}
                >
                  {statusLabels[status]} ({statusReviews.length})
                </Button>
              );
            },
          )}
        </div>

        {/* 내역 추가 버튼 */}
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-1" />
            {statusLabels[selectedStatus]} 내역 추가
          </Button>
        )}

        {/* 내역 추가 폼 */}
        {isAdding && (
          <form
            onSubmit={handleAddSubmit}
            className="space-y-2 p-3 border rounded-lg bg-zinc-50 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className={statusColors[selectedStatus].badgeClass}
              >
                {statusLabels[selectedStatus]}
              </Badge>
              <span className="text-xs text-zinc-500">새 내역</span>
            </div>
            <Textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder={`${statusLabels[selectedStatus]} 상태에 대한 내용을 입력하세요...`}
              rows={4}
              className="resize-none"
            />
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAdding(false);
                  setNewContent("");
                }}
              >
                취소
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "추가 중..." : "추가"}
              </Button>
            </div>
          </form>
        )}

        {/* 내역 목록 */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {isLoading ? (
            <p className="text-sm text-zinc-500 text-center py-8">로딩 중...</p>
          ) : filteredReviews.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">
              {statusLabels[selectedStatus]} 내역이 없습니다
            </p>
          ) : (
            filteredReviews.map((review) => (
              <div
                key={review.id}
                className="p-3 border rounded-lg bg-white dark:bg-zinc-800"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={statusColors[review.status].badgeClass}
                    >
                      {statusLabels[review.status]}
                    </Badge>
                    <span className="text-xs text-zinc-500">
                      {review.createdByName || "알 수 없음"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(review.id);
                        setEditContent(review.content);
                      }}
                      disabled={updateMutation.isPending}
                      title="수정"
                    >
                      <Edit2 className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm("정말 이 내역을 삭제하시겠습니까?")) {
                          deleteMutation.mutate(review.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      title="삭제"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                {editingId === review.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(null);
                          setEditContent("");
                        }}
                      >
                        취소
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleEditSubmit(review.id)}
                        disabled={updateMutation.isPending}
                      >
                        {updateMutation.isPending ? "저장 중..." : "저장"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap mb-2">
                      {review.content}
                    </p>
                    <div className="text-xs text-zinc-400">
                      <div>작성: {formatDate(review.createdAt)}</div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </BaseDialog>
  );
};
