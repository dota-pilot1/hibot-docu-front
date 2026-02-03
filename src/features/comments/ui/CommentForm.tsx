"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { useCreateComment } from "../model/useComments";
import { Send } from "lucide-react";

interface CommentFormProps {
  postId: number;
  parentId?: number;
  onCancel?: () => void;
  placeholder?: string;
}

export function CommentForm({
  postId,
  parentId,
  onCancel,
  placeholder = "댓글을 입력하세요...",
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const { mutate: createComment, isPending } = useCreateComment();

  const handleSubmit = () => {
    if (!content.trim()) return;

    createComment(
      {
        postId,
        data: { content, parentId },
      },
      {
        onSuccess: () => {
          setContent("");
          onCancel?.();
        },
      }
    );
  };

  return (
    <div className="space-y-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="resize-none"
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!content.trim() || isPending}
        >
          <Send className="h-4 w-4 mr-1" />
          {isPending ? "작성 중..." : "작성"}
        </Button>
      </div>
    </div>
  );
}
