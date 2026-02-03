"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// 기존 /posts URL 호환성을 위해 /boards/free로 리다이렉트
export default function PostsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/boards/free");
  }, [router]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
      </div>
    </div>
  );
}
