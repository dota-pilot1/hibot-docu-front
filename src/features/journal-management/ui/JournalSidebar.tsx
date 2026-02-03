"use client";

import { useState } from "react";
import { FolderPlus, FileText } from "lucide-react";
import {
  useJournalTree,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../model/useJournals";
import { JournalTeamItem } from "./JournalTeamItem";
import { Button } from "@/shared/ui/button";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { Input } from "@/shared/ui/input";
import type { JournalType, JournalCategory } from "../api/journalApi";

interface JournalSidebarProps {
  journalType: JournalType;
  selectedCategoryId: number | null;
  expandedTeams: Set<number>;
  onSelectCategory: (category: JournalCategory) => void;
  onToggleTeam: (id: number) => void;
}

export const JournalSidebar: React.FC<JournalSidebarProps> = ({
  journalType,
  selectedCategoryId,
  expandedTeams,
  onSelectCategory,
  onToggleTeam,
}) => {
  const { data: tree = [], isLoading } = useJournalTree(journalType);
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  // 팀 다이얼로그 상태
  const [teamDialog, setTeamDialog] = useState<{
    open: boolean;
    mode: "create" | "rename";
    team?: JournalCategory;
  }>({ open: false, mode: "create" });
  const [teamName, setTeamName] = useState("");

  // 날짜 다이얼로그 상태
  const [dateDialog, setDateDialog] = useState<{
    open: boolean;
    parentId?: number;
  }>({ open: false });
  const [dateName, setDateName] = useState("");

  // 삭제 확인 다이얼로그 상태
  const [deleteTeamDialog, setDeleteTeamDialog] = useState<{
    open: boolean;
    teamId: number | null;
  }>({ open: false, teamId: null });

  const [deleteDateDialog, setDeleteDateDialog] = useState<{
    open: boolean;
    dateId: number | null;
  }>({ open: false, dateId: null });

  // 팀 다이얼로그 핸들러
  const handleOpenCreateTeam = () => {
    setTeamName("");
    setTeamDialog({ open: true, mode: "create" });
  };

  const handleOpenRenameTeam = (team: JournalCategory) => {
    setTeamName(team.name);
    setTeamDialog({ open: true, mode: "rename", team });
  };

  const handleTeamSubmit = async () => {
    if (!teamName.trim()) return;

    if (teamDialog.mode === "create") {
      await createCategoryMutation.mutateAsync({
        name: teamName.trim(),
        journalType,
      });
    } else if (teamDialog.team) {
      await updateCategoryMutation.mutateAsync({
        id: teamDialog.team.id,
        dto: { name: teamName.trim() },
      });
    }
    setTeamDialog({ open: false, mode: "create" });
  };

  const handleDeleteTeam = (teamId: number) => {
    setDeleteTeamDialog({ open: true, teamId });
  };

  const handleConfirmDeleteTeam = async () => {
    if (deleteTeamDialog.teamId) {
      await deleteCategoryMutation.mutateAsync(deleteTeamDialog.teamId);
      setDeleteTeamDialog({ open: false, teamId: null });
    }
  };

  // 날짜 다이얼로그 핸들러
  const handleOpenCreateDate = (parentId: number) => {
    // 기본값으로 오늘 날짜
    const today = new Date().toISOString().split("T")[0];
    setDateName(today);
    setDateDialog({ open: true, parentId });
  };

  const handleDateSubmit = async () => {
    if (!dateName.trim() || !dateDialog.parentId) return;

    const newCategory = await createCategoryMutation.mutateAsync({
      name: dateName.trim(),
      journalType,
      parentId: dateDialog.parentId,
    });

    // 팀 펼치기
    if (!expandedTeams.has(dateDialog.parentId)) {
      onToggleTeam(dateDialog.parentId);
    }

    // 새로 생성된 날짜 카테고리 선택
    onSelectCategory(newCategory);

    setDateDialog({ open: false });
  };

  const handleDeleteDate = (dateId: number) => {
    setDeleteDateDialog({ open: true, dateId });
  };

  const handleConfirmDeleteDate = async () => {
    if (deleteDateDialog.dateId) {
      await deleteCategoryMutation.mutateAsync(deleteDateDialog.dateId);
      setDeleteDateDialog({ open: false, dateId: null });
    }
  };

  if (isLoading) {
    return <div className="p-4 text-gray-500 text-sm">로딩 중...</div>;
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200 dark:border-zinc-700">
        <span className="font-medium text-sm">
          {journalType === "DEV" ? "개발 일지" : "학습 일지"}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleOpenCreateTeam}
          title="새 팀"
        >
          <FolderPlus className="h-4 w-4" />
        </Button>
      </div>

      {/* 팀/날짜 목록 */}
      <div className="flex-1 overflow-y-auto py-2">
        {tree.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
            <FileText className="h-10 w-10 mb-2" />
            <p className="text-sm">팀이 없습니다</p>
            <Button variant="link" size="sm" onClick={handleOpenCreateTeam}>
              새 팀 만들기
            </Button>
          </div>
        ) : (
          tree.map((team) => (
            <JournalTeamItem
              key={team.id}
              team={team}
              isExpanded={expandedTeams.has(team.id)}
              selectedCategoryId={selectedCategoryId}
              onToggle={() => onToggleTeam(team.id)}
              onSelectCategory={onSelectCategory}
              onCreateDate={handleOpenCreateDate}
              onRenameTeam={handleOpenRenameTeam}
              onDeleteTeam={handleDeleteTeam}
              onDeleteDate={handleDeleteDate}
            />
          ))
        )}
      </div>

      {/* 팀 다이얼로그 */}
      <FormDialog
        open={teamDialog.open}
        onOpenChange={(open) => setTeamDialog({ ...teamDialog, open })}
        title={teamDialog.mode === "create" ? "새 팀" : "팀 이름 변경"}
        submitLabel={teamDialog.mode === "create" ? "생성" : "저장"}
        onSubmit={handleTeamSubmit}
        isLoading={
          createCategoryMutation.isPending || updateCategoryMutation.isPending
        }
        maxWidth="sm:max-w-xs"
      >
        <Input
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="팀 이름"
          autoFocus
        />
      </FormDialog>

      {/* 날짜 다이얼로그 */}
      <FormDialog
        open={dateDialog.open}
        onOpenChange={(open) => setDateDialog({ ...dateDialog, open })}
        title="새 날짜"
        submitLabel="생성"
        onSubmit={handleDateSubmit}
        isLoading={createCategoryMutation.isPending}
        maxWidth="sm:max-w-xs"
      >
        <Input
          type="date"
          value={dateName}
          onChange={(e) => setDateName(e.target.value)}
          autoFocus
        />
      </FormDialog>

      {/* 팀 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={deleteTeamDialog.open}
        onOpenChange={(open) =>
          setDeleteTeamDialog({ ...deleteTeamDialog, open })
        }
        title="팀 삭제"
        description="팀을 삭제하시겠습니까? 팀 내 모든 날짜와 일지도 함께 삭제됩니다."
        confirmLabel="삭제"
        onConfirm={handleConfirmDeleteTeam}
        variant="destructive"
      />

      {/* 날짜 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={deleteDateDialog.open}
        onOpenChange={(open) =>
          setDeleteDateDialog({ ...deleteDateDialog, open })
        }
        title="날짜 삭제"
        description="이 날짜를 삭제하시겠습니까? 날짜 내 모든 일지도 함께 삭제됩니다."
        confirmLabel="삭제"
        onConfirm={handleConfirmDeleteDate}
        variant="destructive"
      />
    </div>
  );
};
