import { BoardPostListPage } from "./BoardPostListPage";

// Static export를 위한 기본 게시판 코드
export function generateStaticParams() {
  return [{ boardCode: "free" }, { boardCode: "notice" }, { boardCode: "qna" }];
}

interface Props {
  params: Promise<{ boardCode: string }>;
}

export default async function BoardPostsPage({ params }: Props) {
  const { boardCode } = await params;
  return <BoardPostListPage boardCode={boardCode} />;
}
