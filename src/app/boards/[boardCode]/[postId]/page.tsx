import { BoardPostDetailClient } from "./BoardPostDetailClient";

// Static export를 위한 기본 params
// 실제 postId는 동적으로 생성되므로 빈 배열 반환
export async function generateStaticParams() {
  // 부모 라우트의 boardCode에 대한 빈 postId 배열
  return [
    { boardCode: "free", postId: "1" },
    { boardCode: "notice", postId: "1" },
    { boardCode: "qna", postId: "1" },
  ];
}

interface Props {
  params: Promise<{ boardCode: string; postId: string }>;
}

export default async function BoardPostDetailPage({ params }: Props) {
  const { boardCode, postId } = await params;
  return <BoardPostDetailClient boardCode={boardCode} postId={postId} />;
}
