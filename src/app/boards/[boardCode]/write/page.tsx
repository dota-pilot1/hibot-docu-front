import { Suspense } from "react";
import { BoardPostWriteClient } from "./BoardPostWriteClient";

// Static export를 위한 기본 게시판 코드
export function generateStaticParams() {
  return [{ boardCode: "free" }, { boardCode: "notice" }, { boardCode: "qna" }];
}

interface Props {
  params: Promise<{ boardCode: string }>;
}

export default async function BoardPostWritePage({ params }: Props) {
  const { boardCode } = await params;

  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-24" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      }
    >
      <BoardPostWriteClient boardCode={boardCode} />
    </Suspense>
  );
}
