"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  FolderOpen,
  TrashIcon,
  ArrowRight,
  Terminal,
  Link,
  FileText,
} from "lucide-react";
import type { FavoriteCategory } from "@/entities/favorite/model/types";

interface FavoriteCardProps {
  project: FavoriteCategory;
  isAdminMode?: boolean;
  onDelete?: (id: number) => void;
}

export const FavoriteCard = ({
  project,
  isAdminMode = false,
  onDelete,
}: FavoriteCardProps) => {
  const router = useRouter();
  const subCategoryCount = project.children?.length || 0;

  const handleNavigate = () => {
    router.push(`/favorites?category=${project.id}`);
  };

  const getTypeIcon = () => {
    switch (project.favoriteType) {
      case "COMMAND":
        return <Terminal className="h-3.5 w-3.5" />;
      case "LINK":
        return <Link className="h-3.5 w-3.5" />;
      case "DOCUMENT":
        return <FileText className="h-3.5 w-3.5" />;
      default:
        return <FolderOpen className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-800/30 border border-gray-200 dark:border-zinc-700 overflow-hidden shadow-sm hover:border-purple-500/50 hover:shadow-lg transition-all duration-300 group relative flex flex-col">
      {/* 상단 컨텐츠 영역 */}
      <div className="p-4 flex-1">
        <div className="flex items-start justify-between mb-2">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            {project.favoriteType || "ROOT"}
          </span>
          <Badge className="bg-purple-600 text-white dark:bg-purple-500 dark:text-white border-none text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
            Favorite
          </Badge>
        </div>

        <div className="space-y-1 mb-3">
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
            {project.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {project.description || "즐겨찾기 항목을 관리하세요."}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            {getTypeIcon()}
            <span>카테고리 {subCategoryCount}</span>
          </div>
        </div>
      </div>

      {/* 하단 버튼 영역 */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-zinc-700 flex items-center justify-between">
        {isAdminMode && onDelete ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project.id);
            }}
            className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <TrashIcon className="h-3.5 w-3.5 mr-1" />
            삭제
          </Button>
        ) : (
          <div />
        )}
        <Button
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600 px-4"
          onClick={handleNavigate}
        >
          보기
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
};
