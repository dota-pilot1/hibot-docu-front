"use client";

import React, { useState, useEffect } from "react";
import { BaseDialog, FormField } from "@/shared/ui/dialogs/BaseDialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Badge } from "@/shared/ui/badge";
import { Calendar, Tag, X, Save, Edit2, Plus } from "lucide-react";
import { useUpdateJournal } from "../model/useJournals";
import type { Journal } from "../api/journalApi";

interface JournalDetailDialogProps {
  journal: Journal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startInEditMode?: boolean;
}

export const JournalDetailDialog: React.FC<JournalDetailDialogProps> = ({
  journal,
  open,
  onOpenChange,
  startInEditMode = false,
}) => {
  const updateJournalMutation = useUpdateJournal();

  const [isEditing, setIsEditing] = useState(startInEditMode);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (journal && open) {
      setEditTitle(journal.title);
      setEditContent(journal.content || "");
      setEditTags(journal.tags || []);
      setIsEditing(startInEditMode);
    }
  }, [journal, open, startInEditMode]);

  const handleSave = async () => {
    if (!journal || !editTitle.trim()) return;

    await updateJournalMutation.mutateAsync({
      id: journal.id,
      dto: {
        title: editTitle.trim(),
        content: editContent,
        tags: editTags,
      },
    });

    onOpenChange(false);
  };

  const handleCancel = () => {
    if (journal) {
      setEditTitle(journal.title);
      setEditContent(journal.content || "");
      setEditTags(journal.tags || []);
    }
    setIsEditing(false);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editTags.includes(newTag.trim())) {
      setEditTags([...editTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setEditTags(editTags.filter((t) => t !== tag));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  if (!journal) return null;

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "일지 수정" : "일지 상세"}
      maxWidth="max-w-2xl"
      footer={
        isEditing ? (
          <>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={updateJournalMutation.isPending}
            >
              취소
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateJournalMutation.isPending}
            >
              <Save className="h-4 w-4 mr-1" />
              {updateJournalMutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)}>
            <Edit2 className="h-4 w-4 mr-1" />
            수정
          </Button>
        )
      }
    >
      <div className="space-y-4">
        {/* 제목 */}
        {isEditing ? (
          <FormField label="제목" required>
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="제목"
            />
          </FormField>
        ) : (
          <h2 className="text-xl font-bold text-foreground">{editTitle}</h2>
        )}

        {/* 날짜 */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(journal.journalDate)}</span>
        </div>

        {/* 태그 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {isEditing ? (
              <>
                {editTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1 cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
                <form
                  className="flex items-center gap-1"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddTag();
                  }}
                >
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="태그 추가"
                    className="h-7 w-24 text-xs"
                  />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </form>
              </>
            ) : editTags.length > 0 ? (
              editTags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-sm">태그 없음</span>
            )}
          </div>
        </div>

        {/* 내용 */}
        {isEditing ? (
          <FormField label="내용">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="일지 내용을 입력하세요..."
              className="min-h-[300px]"
            />
          </FormField>
        ) : (
          <div className="whitespace-pre-wrap text-foreground/80 min-h-[200px] p-4 bg-muted/30 rounded-lg">
            {editContent || "내용이 없습니다."}
          </div>
        )}
      </div>
    </BaseDialog>
  );
};
