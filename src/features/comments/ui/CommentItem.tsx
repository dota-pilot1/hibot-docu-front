"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { useUserStore } from "@/entities/user/model/store";
import { useUpdateComment, useDeleteComment } from "../model/useComments";
import { CommentForm } from "./CommentForm";
import type { Comment } from "../api/commentsApi";
import { User, Pencil, Trash2, CornerDownRight, MessageSquare } from "lucide-react";

interface CommentItemProps {
  comment: Comment;
  postId: number;
}

export function CommentItem({ comment, postId }: CommentItemProps) {
  const user = useUserStore((state) => state.user);
  const isAuthor = user?.userId === comment.authorId;

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { mutate: updateComment, isPending: isUpdating } = useUpdateComment();
  const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment();

  const handleUpdate = () => {
    if (!editContent.trim()) return;

    updateComment(
      {
        commentId: comment.id,
        postId,
        data: { content: editContent },
      },
      {
        onSuccess: () => setIsEditing(false),
      }
    );
  };

  const handleDelete = () => {
    deleteComment(
      { commentId: comment.id, postId },
      {
        onSuccess: () => setShowDeleteDialog(false),
      }
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`${comment.depth > 0 ? "ml-8 border-l-2 border-gray-100 pl-4" : ""}`}>
      <div className="py-3">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {comment.depth > 0 && (
              <CornerDownRight className="h-4 w-4 text-gray-400" />
            )}
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              {comment.authorProfileImage ? (
                <img
                  src={comment.authorProfileImage}
                  alt={comment.authorName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User className="h-4 w-4 text-gray-500" />
              )}
            </div>
            <div>
              <span className="font-medium text-sm">{comment.authorName}</span>
              <span className="text-xs text-gray-400 ml-2">
                {formatDate(comment.createdAt)}
                {comment.isEdited && " (수정됨)"}
              </span>
            </div>
          </div>

          {/* 액션 버튼 */}
          {isAuthor && !comment.isDeleted && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="h-7 px-2"
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="h-7 px-2 text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* 내용 */}
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
              >
                취소
              </Button>
              <Button
                size="sm"
                onClick={handleUpdate}
                disabled={!editContent.trim() || isUpdating}
              >
                {isUpdating ? "수정 중..." : "수정"}
              </Button>
            </div>
          </div>
        ) : (
          <p className={`text-sm whitespace-pre-wrap ${comment.isDeleted ? "text-gray-400 italic" : "text-gray-700"}`}>
            {comment.content}
          </p>
        )}

        {/* 답글 버튼 */}
        {!comment.isDeleted && comment.depth === 0 && (
          <div className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="h-7 px-2 text-gray-500"
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              답글
            </Button>
          </div>
        )}

        {/* 답글 폼 */}
        {showReplyForm && (
          <div className="mt-3 ml-4">
            <CommentForm
              postId={postId}
              parentId={comment.id}
              onCancel={() => setShowReplyForm(false)}
              placeholder="답글을 입력하세요..."
            />
          </div>
        )}
      </div>

      {/* 대댓글 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-0">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} postId={postId} />
          ))}
        </div>
      )}

      {/* 삭제 확인 */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="댓글 삭제"
        description="이 댓글을 삭제하시겠습니까?"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
