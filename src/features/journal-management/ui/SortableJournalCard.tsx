"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, Edit2, Trash2, GripVertical } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
  CardFooter,
} from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import type { Journal } from "../api/journalApi";

interface SortableJournalCardProps {
  journal: Journal;
  onViewDetail: (journal: Journal) => void;
  onEdit: (journal: Journal) => void;
  onDelete: (journal: Journal) => void;
}

export const SortableJournalCard: React.FC<SortableJournalCardProps> = ({
  journal,
  onViewDetail,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: journal.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const truncateContent = (content: string | undefined, maxLength: number) => {
    if (!content) return "내용이 없습니다.";
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={cn(
          "rounded-lg hover:shadow-md transition-shadow group",
          isDragging && "opacity-50 shadow-lg z-50",
        )}
      >
        <CardHeader className="pb-2 pt-4 px-4 bg-transparent border-b-0">
          <div className="flex items-center gap-2">
            {/* 드래그 핸들 */}
            <div
              {...attributes}
              {...listeners}
              className={cn(
                "cursor-grab active:cursor-grabbing p-0.5 rounded",
                "hover:bg-zinc-200 dark:hover:bg-zinc-700",
              )}
            >
              <GripVertical className="h-4 w-4 text-zinc-400" />
            </div>
            <CardTitle className="text-base line-clamp-1 flex-1">
              {journal.title}
            </CardTitle>
          </div>
          <CardAction>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(journal);
                }}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-500 hover:text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(journal);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardAction>
        </CardHeader>

        <CardContent className="px-4 py-3 space-y-3">
          {/* 날짜 */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(journal.journalDate)}</span>
          </div>

          {/* 내용 미리보기 */}
          <p className="text-sm text-muted-foreground line-clamp-3">
            {truncateContent(journal.content, 100)}
          </p>

          {/* 태그 */}
          {journal.tags && journal.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {journal.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {journal.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{journal.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="px-4 pb-4 pt-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onViewDetail(journal)}
          >
            상세 보기
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
