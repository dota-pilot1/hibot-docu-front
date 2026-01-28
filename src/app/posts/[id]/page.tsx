import PostDetailClient from "./PostDetailClient";

// Static export 모드에서 동적 라우트를 위한 placeholder
// CloudFront 커스텀 에러 페이지 설정으로 SPA 라우팅 처리
export function generateStaticParams() {
  // 빌드 시 최소한의 placeholder 생성
  // 나머지는 CloudFront에서 404 → /index.html fallback으로 처리
  return [{ id: "_" }];
}

export default function PostDetailPage() {
  return <PostDetailClient />;
}
