"use client";

import { useParams, useRouter } from "next/navigation";
import { usePost, useDeletePost } from "@/features/posts/model/usePosts";
import { Button } from "@/shared/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { ArrowLeft, Pencil, Trash2, Eye, Calendar, User } from "lucide-react";
import { useState } from "react";
import { useUserStore } from "@/entities/user/model/store";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { MarkdownCodeBlock } from "@/shared/ui/MarkdownCodeBlock";
import { MarkdownImage } from "@/shared/ui/MarkdownImage";

export default function PostDetailClient() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const user = useUserStore((state) => state.user);

  const { data: post, isLoading } = usePost(id);
  const deletePost = useDeletePost();

  const [confirmDelete, setConfirmDelete] = useState(false);

  const isAuthor = user?.userId === post?.authorId;

  const handleDelete = async () => {
    await deletePost.mutateAsync(id);
    router.push("/posts");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center text-gray-500">
          게시글을 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/posts")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          목록으로
        </Button>
        {isAuthor && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/posts/write?edit=${id}`)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              수정
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              삭제
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="border-b bg-gray-50">
          <div className="space-y-3">
            <CardTitle className="text-2xl">{post.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {post.authorName}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.viewCount}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="py-6">
          <div className="prose prose-lg max-w-none prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              components={{
                code: MarkdownCodeBlock as any,
                img: MarkdownImage as any,
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="게시글 삭제"
        description="정말로 이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
