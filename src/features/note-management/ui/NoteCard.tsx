"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { FolderOpen, TrashIcon, ArrowRight } from "lucide-react";
import type { NoteCategory } from "@/entities/note/model/types";

interface NoteCardProps {
  note: NoteCategory;
  isAdminMode?: boolean;
  onDelete?: (id: number) => void;
}

export const NoteCard = ({
  note,
  isAdminMode = false,
  onDelete,
}: NoteCardProps) => {
  const router = useRouter();
  const subCategoryCount = note.children?.length || 0;

  const handleNavigate = () => {
    router.push(`/notes?category=${note.id}`);
  };

  return (
    <div className="bg-white dark:bg-zinc-800/30 border border-gray-200 dark:border-zinc-700 overflow-hidden shadow-sm hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 group relative flex flex-col">
      {/* 상단 컨텐츠 영역 */}
      <div className="p-4 flex-1">
        <div className="flex items-start justify-between mb-2">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            {note.noteType || "NOTE"}
          </span>
          <Badge className="bg-blue-600 text-white border-none text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
            Personal
          </Badge>
        </div>

        <div className="space-y-1 mb-3">
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
            {note.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {note.description || "노트를 확인하세요."}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <FolderOpen className="h-3.5 w-3.5" />
            <span>하위 노트 {subCategoryCount}</span>
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
              onDelete(note.id);
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
          className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 px-4"
          onClick={handleNavigate}
        >
          노트 보기
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
};
