"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { favoriteApi } from "@/features/favorite-management/api/favoriteApi";
import { Button } from "@/shared/ui/button";
import { Star, ExternalLink, Loader2, FolderOpen, Terminal, Link as LinkIcon } from "lucide-react";
import type { FavoriteContent, FavoriteType } from "@/entities/favorite/model/types";

interface FavoritesTabProps {
  onClose: () => void;
}

export const FavoritesTab = ({ onClose }: FavoritesTabProps) => {
  const router = useRouter();

  // 즐겨찾기 트리 조회 (카테고리 목록)
  const { data: categories, isLoading } = useQuery({
    queryKey: ["favorites", "tree"],
    queryFn: favoriteApi.getTree,
  });

  // 최근 즐겨찾기 아이템들 조회 (각 카테고리별로)
  const { data: allContents } = useQuery({
    queryKey: ["favorites", "recent-contents"],
    queryFn: async () => {
      if (!categories || categories.length === 0) return [];

      // 모든 카테고리의 컨텐츠 가져오기
      const contentsPromises = categories.map((cat) =>
        favoriteApi.getContents(cat.id).catch(() => [])
      );
      const results = await Promise.all(contentsPromises);

      // 모든 컨텐츠를 하나의 배열로 합치고 최근 순으로 정렬
      const allItems = results.flat();
      return allItems
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 10); // 최근 10개만
    },
    enabled: !!categories && categories.length > 0,
  });

  const handleViewAll = () => {
    onClose();
    router.push("/favorites");
  };

  const getContentIcon = (contentType: FavoriteType) => {
    switch (contentType) {
      case "COMMAND":
        return <Terminal className="h-4 w-4 text-green-500" />;
      case "LINK":
        return <LinkIcon className="h-4 w-4 text-blue-500" />;
      case "DOCUMENT":
        return <FolderOpen className="h-4 w-4 text-orange-500" />;
      default:
        return <Star className="h-4 w-4 text-yellow-500" />;
    }
  };

  const handleItemClick = (item: FavoriteContent) => {
    // LINK 타입이면 새 창에서 열기
    if (item.contentType === "LINK" && item.metadata?.url) {
      window.open(item.metadata.url, "_blank");
    } else {
      // 그 외에는 즐겨찾기 페이지로 이동
      onClose();
      router.push("/favorites");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <span className="text-sm text-muted-foreground">최근 즐겨찾기</span>
        <Button size="sm" variant="ghost" onClick={handleViewAll} className="gap-1.5">
          전체 보기
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* 목록 */}
      <div className="flex-1 overflow-y-auto">
        {!allContents || allContents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Star className="h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm">즐겨찾기가 없습니다</p>
            <Button
              variant="link"
              size="sm"
              onClick={handleViewAll}
              className="mt-2"
            >
              즐겨찾기 추가하기
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {allContents.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-start gap-3"
              >
                <div className="mt-0.5">{getContentIcon(item.contentType)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.title}</p>
                  {item.content && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {item.content}
                    </p>
                  )}
                  {item.metadata?.url && (
                    <p className="text-xs text-blue-500 truncate mt-0.5">
                      {item.metadata.url}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
