"use client";

import React from "react";
import { Calendar, Edit2, Trash2, User } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import type { Journal } from "../api/journalApi";
import { useQuery } from "@tanstack/react-query";
import { organizationApi } from "@/features/organization/api/organizationApi";

interface JournalCardProps {
  journal: Journal;
  onViewDetail: (journal: Journal) => void;
  onEdit: (journal: Journal) => void;
  onDelete: (journal: Journal) => void;
}

export const JournalCard: React.FC<JournalCardProps> = ({
  journal,
  onViewDetail,
  onEdit,
  onDelete,
}) => {
  // 작성자 정보 조회
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => organizationApi.getUsers(),
  });

  const author = users.find((u) => u.id === journal.userId);
  const authorName =
    author?.name || author?.email.split("@")[0] || "알 수 없음";
  const authorInitial = authorName.charAt(0).toUpperCase();

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
    <Card className="rounded-lg hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 pt-4 px-4 bg-transparent border-b-0">
        <CardTitle className="text-base line-clamp-1">
          {journal.title}
        </CardTitle>
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
        {/* 작성자 및 날짜 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={author?.profileImage || undefined} />
              <AvatarFallback className="text-xs bg-zinc-200 dark:bg-zinc-700">
                {authorInitial}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{authorName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(journal.journalDate)}</span>
          </div>
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
  );
};
