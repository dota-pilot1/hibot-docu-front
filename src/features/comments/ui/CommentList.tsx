"use client";

import { useComments } from "../model/useComments";
import { CommentForm } from "./CommentForm";
import { CommentItem } from "./CommentItem";
import { MessageSquare } from "lucide-react";

interface CommentListProps {
  postId: number;
}

export function CommentList({ postId }: CommentListProps) {
  const { data: comments, isLoading } = useComments(postId);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-20 bg-gray-100 rounded"></div>
        <div className="h-16 bg-gray-100 rounded"></div>
      </div>
    );
  }

  const totalCount = comments?.reduce((acc, comment) => {
    return acc + 1 + (comment.replies?.length || 0);
  }, 0) || 0;

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center gap-2 pb-2 border-b">
        <MessageSquare className="h-5 w-5" />
        <h3 className="font-semibold">댓글 {totalCount}개</h3>
      </div>

      {/* 댓글 작성 폼 */}
      <CommentForm postId={postId} />

      {/* 댓글 목록 */}
      <div className="divide-y">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} postId={postId} />
          ))
        ) : (
          <div className="py-8 text-center text-gray-400">
            첫 번째 댓글을 작성해보세요!
          </div>
        )}
      </div>
    </div>
  );
}
