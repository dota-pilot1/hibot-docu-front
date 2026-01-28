import PostDetailClient from "./PostDetailClient";

// Static export - fallback 페이지 생성
export function generateStaticParams() {
  // 빈 배열 반환 시 빌드 실패하므로 placeholder 반환
  // CloudFront에서 404 → index.html fallback 설정 필요
  return [{ id: "_" }];
}

export default function PostDetailPage() {
  return <PostDetailClient />;
}
