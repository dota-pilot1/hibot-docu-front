"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { FolderOpen, TrashIcon, ArrowRight } from "lucide-react";
import type { ReviewCategory } from "@/entities/review/model/types";

interface ReviewCardProps {
  project: ReviewCategory;
  isAdminMode?: boolean;
  onDelete?: (id: number) => void;
}

export const ReviewCard = ({
  project,
  isAdminMode = false,
  onDelete,
}: ReviewCardProps) => {
  const router = useRouter();
  const subCategoryCount = project.children?.length || 0;

  const handleNavigate = () => {
    router.push(`/reviews?project=${project.projectType || project.id}`);
  };

  return (
    <div className="bg-white dark:bg-zinc-800/30 border border-gray-200 dark:border-zinc-700 overflow-hidden shadow-sm hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 group relative flex flex-col">
      {/* 상단 컨텐츠 영역 */}
      <div className="p-4 flex-1">
        <div className="flex items-start justify-between mb-2">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            {project.projectType || "General"}
          </span>
          <Badge className="bg-blue-600 text-white dark:bg-blue-500 dark:text-white border-none text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
            Review
          </Badge>
        </div>

        <div className="space-y-1 mb-3">
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
            {project.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {project.description || "코드 리뷰 문서를 확인하세요."}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <FolderOpen className="h-3.5 w-3.5" />
            <span>카테고리 {subCategoryCount}</span>
          </div>
        </div>
      </div>

      {/* 하단 버튼 영역 */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-zinc-900/50 border-t border-gray-200 dark:border-zinc-700 flex items-center justify-between">
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
          className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 px-4"
          onClick={handleNavigate}
        >
          문서 보기
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
};
