"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableJournalCard } from "./SortableJournalCard";
import { JournalDetailDialog } from "./JournalDetailDialog";
import { FormDialog, FormField } from "@/shared/ui/dialogs/BaseDialog";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { cn } from "@/shared/lib/utils";
import { FileText, Plus } from "lucide-react";
import type { Journal } from "../api/journalApi";
import {
  useJournalList,
  useCreateJournal,
  useDeleteJournal,
  useReorderJournals,
} from "../model/useJournals";
import type { JournalPanel } from "../model/useJournalTabStore";

interface JournalDetailViewProps {
  panel: JournalPanel;
  isDragging?: boolean;
}

export const JournalDetailView: React.FC<JournalDetailViewProps> = ({
  panel,
  isDragging,
}) => {
  const [mounted, setMounted] = useState(false);
  const activeTab = panel.tabs.find((t) => t.id === panel.activeTabId);

  // TanStack Query hooks
  const { data: journals = [], isLoading } = useJournalList(
    activeTab?.categoryId,
  );
  const createJournalMutation = useCreateJournal();
  const deleteJournalMutation = useDeleteJournal();
  const reorderJournalsMutation = useReorderJournals();

  // 로컬 순서 상태 (드래그 중 즉시 반영)
  const [localJournals, setLocalJournals] = useState<Journal[]>([]);

  // DnD 센서
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // 서버 데이터가 변경되면 로컬 상태 업데이트
  useEffect(() => {
    if (JSON.stringify(journals) !== JSON.stringify(localJournals)) {
      setLocalJournals(journals);
    }
  }, [journals]);

  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [startInEditMode, setStartInEditMode] = useState(false);

  // 일지 추가 다이얼로그
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newJournalTitle, setNewJournalTitle] = useState("");
  const [newJournalContent, setNewJournalContent] = useState("");

  // 삭제 확인 다이얼로그
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [journalToDelete, setJournalToDelete] = useState<Journal | null>(null);

  const { setNodeRef, isOver } = useDroppable({
    id: `content-drop-${panel.id}`,
    data: { type: "CONTENT", panelId: panel.id },
  });

  const handleViewDetail = (journal: Journal) => {
    setSelectedJournal(journal);
    setStartInEditMode(false);
    setDialogOpen(true);
  };

  const handleEdit = (journal: Journal) => {
    setSelectedJournal(journal);
    setStartInEditMode(true);
    setDialogOpen(true);
  };

  const handleDeleteClick = (journal: Journal) => {
    setJournalToDelete(journal);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!journalToDelete) return;

    await deleteJournalMutation.mutateAsync(journalToDelete.id);
    setDeleteDialogOpen(false);
    setJournalToDelete(null);
  };

  const handleCreateJournal = async () => {
    if (!activeTab || !newJournalTitle.trim()) return;

    await createJournalMutation.mutateAsync({
      categoryId: activeTab.categoryId,
      title: newJournalTitle.trim(),
      content: newJournalContent.trim(),
    });

    setNewJournalTitle("");
    setNewJournalContent("");
    setCreateDialogOpen(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && activeTab) {
      const oldIndex = localJournals.findIndex((j) => j.id === active.id);
      const newIndex = localJournals.findIndex((j) => j.id === over.id);

      const newOrder = arrayMove(localJournals, oldIndex, newIndex);
      setLocalJournals(newOrder);

      // 서버에 순서 변경 요청
      reorderJournalsMutation.mutate({
        categoryId: activeTab.categoryId,
        journalIds: newOrder.map((j) => j.id),
      });
    }
  };

  if (!mounted || !activeTab) {
    return (
      <div
        ref={setNodeRef}
        className={cn(
          "h-full flex items-center justify-center text-gray-400 bg-gray-50 dark:bg-zinc-900/50",
          isOver &&
            isDragging &&
            "bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-400 ring-inset",
        )}
      >
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>날짜를 선택해주세요</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        ref={setNodeRef}
        className="h-full flex items-center justify-center text-gray-400 bg-gray-50 dark:bg-zinc-900/50"
      >
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <>
      <div
        ref={setNodeRef}
        className={cn(
          "h-full flex flex-col bg-gray-50 dark:bg-zinc-900/50",
          isOver &&
            isDragging &&
            "bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-400 ring-inset",
        )}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
          <h2 className="font-medium text-gray-900 dark:text-gray-100">
            {activeTab.title} 일지
          </h2>
          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            일지 추가
          </Button>
        </div>

        {/* 카드 그리드 */}
        <div className="flex-1 overflow-y-auto p-4">
          {localJournals.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>일지가 없습니다</p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  새 일지 추가
                </Button>
              </div>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={localJournals.map((j) => j.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {localJournals.map((journal) => (
                    <SortableJournalCard
                      key={journal.id}
                      journal={journal}
                      onViewDetail={handleViewDetail}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {/* 상세 보기/수정 다이얼로그 */}
      <JournalDetailDialog
        journal={selectedJournal}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        startInEditMode={startInEditMode}
      />

      {/* 일지 추가 다이얼로그 */}
      <FormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        title="새 일지"
        submitLabel="생성"
        onSubmit={handleCreateJournal}
        isSubmitting={createJournalMutation.isPending}
        maxWidth="max-w-lg"
      >
        <FormField label="제목" required>
          <Input
            value={newJournalTitle}
            onChange={(e) => setNewJournalTitle(e.target.value)}
            placeholder="일지 제목"
            autoFocus
          />
        </FormField>
        <FormField label="내용">
          <Textarea
            value={newJournalContent}
            onChange={(e) => setNewJournalContent(e.target.value)}
            placeholder="일지 내용을 입력하세요..."
            className="min-h-[200px]"
          />
        </FormField>
      </FormDialog>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="일지 삭제"
        description={`"${journalToDelete?.title}" 일지를 삭제하시겠습니까?`}
        confirmLabel="삭제"
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />
    </>
  );
};
