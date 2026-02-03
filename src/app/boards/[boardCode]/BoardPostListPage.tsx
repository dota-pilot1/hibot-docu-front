"use client";

import { BoardPostList } from "@/features/posts/ui/BoardPostList";
import { useBoard } from "@/features/boards/model/useBoards";

interface Props {
  boardCode: string;
}

export function BoardPostListPage({ boardCode }: Props) {
  const { data: board, isLoading } = useBoard(boardCode);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{board?.name || "게시판"}</h1>
        {board?.description && (
          <p className="text-gray-500 mt-1">{board.description}</p>
        )}
      </div>
      <BoardPostList boardCode={boardCode} />
    </div>
  );
}
