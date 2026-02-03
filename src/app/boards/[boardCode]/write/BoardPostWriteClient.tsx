"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePost, useCreatePostInBoard, useUpdatePost } from "@/features/posts/model/usePosts";
import { useBoard } from "@/features/boards/model/useBoards";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import dynamic from "next/dynamic";

const LexicalEditor = dynamic(
  () => import("@/shared/ui/lexical/LexicalEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full bg-gray-50 animate-pulse rounded-lg border border-gray-200" />
    ),
  }
);

interface Props {
  boardCode: string;
}

export function BoardPostWriteClient({ boardCode }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = !!editId;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { data: board } = useBoard(boardCode);
  const { data: existingPost } = usePost(editId ? Number(editId) : 0);
  const createPost = useCreatePostInBoard();
  const updatePost = useUpdatePost();

  useEffect(() => {
    if (existingPost && isEditMode) {
      setTitle(existingPost.title);
      setContent(existingPost.content);
    }
  }, [existingPost, isEditMode]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    try {
      if (isEditMode) {
        await updatePost.mutateAsync({
          id: Number(editId),
          data: { title, content },
        });
      } else {
        await createPost.mutateAsync({
          boardCode,
          data: { title, content },
        });
      }
      router.push(`/boards/${boardCode}`);
    } catch (error: any) {
      alert(error.response?.data?.message || "오류가 발생했습니다.");
    }
  };

  const isLoading = createPost.isPending || updatePost.isPending;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push(`/boards/${boardCode}`)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        목록으로
      </Button>

      <Card>
        <CardHeader className="border-b bg-gray-50">
          <CardTitle>
            {board?.name ? `${board.name} - ` : ""}
            {isEditMode ? "게시글 수정" : "새 게시글 작성"}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              className="text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              내용
            </label>
            <LexicalEditor
              value={content}
              onChange={setContent}
              placeholder="내용을 입력하세요..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/boards/${boardCode}`)}
            >
              취소
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "저장 중..." : isEditMode ? "수정" : "등록"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
