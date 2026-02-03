"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Loader2, BookOpen, Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  useSkillsWithUserLevels,
  useUpdateUserSkill,
  skillLevelConfig,
  useAllSkills,
  useCreateSkill,
  useUpdateSkill,
  useDeleteSkill,
} from "@/entities/skill";
import type { Skill } from "@/entities/skill";
import { SkillLevelSlider } from "./SkillLevelSlider";
import { toast } from "sonner";

interface UserSkillPanelProps {
  userId: number;
  userName?: string;
  isOwnProfile?: boolean;
}

type ModalMode = "skill-add" | "skill-edit" | null;

export function UserSkillPanel({
  userId,
  userName,
  isOwnProfile = false,
}: UserSkillPanelProps) {
  const { data: skillsWithLevels, isLoading } = useSkillsWithUserLevels(userId);
  const { data: allSkills } = useAllSkills();
  const updateUserSkill = useUpdateUserSkill(userId);
  const [updatingSkillId, setUpdatingSkillId] = useState<number | null>(null);

  // 스킬 관리 mutation hooks
  const createSkill = useCreateSkill();
  const updateSkill = useUpdateSkill();
  const deleteSkill = useDeleteSkill();

  // 모달 상태
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  // 스킬 폼
  const [skillForm, setSkillForm] = useState({
    name: "",
    description: "",
    maxLevel: 5,
  });

  const resetForms = () => {
    setSkillForm({ name: "", description: "", maxLevel: 5 });
    setSelectedSkill(null);
    setModalMode(null);
  };

  // 스킬 핸들러
  const handleAddSkill = () => {
    setSkillForm({ name: "", description: "", maxLevel: 5 });
    setModalMode("skill-add");
  };

  const handleEditSkill = (skill: Skill) => {
    setSelectedSkill(skill);
    setSkillForm({
      name: skill.name,
      description: skill.description || "",
      maxLevel: skill.maxLevel,
    });
    setModalMode("skill-edit");
  };

  const handleDeleteSkill = async (skill: Skill) => {
    if (!confirm(`"${skill.name}" 스킬을 삭제하시겠습니까?`)) return;
    try {
      await deleteSkill.mutateAsync(skill.id);
      toast.success("스킬이 삭제되었습니다.");
    } catch (error) {
      toast.error("스킬 삭제에 실패했습니다.");
    }
  };

  const handleSaveSkill = async () => {
    if (!skillForm.name.trim()) {
      toast.error("스킬 이름을 입력하세요.");
      return;
    }
    try {
      if (modalMode === "skill-add") {
        await createSkill.mutateAsync(skillForm);
        toast.success("스킬이 추가되었습니다.");
      } else if (modalMode === "skill-edit" && selectedSkill) {
        await updateSkill.mutateAsync({
          id: selectedSkill.id,
          data: skillForm,
        });
        toast.success("스킬이 수정되었습니다.");
      }
      resetForms();
    } catch (error) {
      toast.error("저장에 실패했습니다.");
    }
  };

  const handleSkillLevelChange = async (skillId: number, level: number) => {
    if (!isOwnProfile) return;

    setUpdatingSkillId(skillId);
    try {
      await updateUserSkill.mutateAsync({
        skillId,
        data: { level },
      });
      toast.success("스킬 레벨이 업데이트되었습니다.");
    } catch (error) {
      toast.error("스킬 레벨 업데이트에 실패했습니다.");
    } finally {
      setUpdatingSkillId(null);
    }
  };

  // 유저 스킬 레벨 맵
  const userSkillMap = new Map<number, number>();
  skillsWithLevels?.forEach((skill) => {
    userSkillMap.set(skill.id, skill.userSkill?.level || 0);
  });

  // 표시할 스킬 목록
  const displaySkills = allSkills || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4">
      {/* 상단 툴바: 스킬 추가 버튼 */}
      <div className="flex items-center justify-between mb-4">
        <Button onClick={handleAddSkill} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          스킬 추가
        </Button>
      </div>

      {/* 스킬 목록 - 3열 그리드 카드 */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
          {displaySkills.map((skill) => {
            const level = userSkillMap.get(skill.id) || 0;
            const config = skillLevelConfig[level];

            return (
              <div
                key={skill.id}
                className="border rounded-lg p-4 hover:bg-muted/50 hover:shadow-sm transition-all"
              >
                {/* 카드 헤더: 레벨 뱃지 + 스킬명 */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold",
                        config.bgColor,
                        config.color,
                      )}
                    >
                      {level}
                    </div>
                    <div>
                      <h3 className="font-semibold">{skill.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        최대 Lv.{skill.maxLevel}
                      </p>
                    </div>
                  </div>
                  {/* 액션 버튼 */}
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => handleEditSkill(skill)}
                      title="스킬 수정"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => handleDeleteSkill(skill)}
                      title="스킬 삭제"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>

                {/* 설명 */}
                {skill.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {skill.description}
                  </p>
                )}

                {/* 레벨 슬라이더 */}
                {isOwnProfile && (
                  <div className="pt-2 border-t">
                    <SkillLevelSlider
                      level={level}
                      maxLevel={skill.maxLevel}
                      onChange={(newLevel) =>
                        handleSkillLevelChange(skill.id, newLevel)
                      }
                      disabled={updatingSkillId === skill.id}
                      showLabel
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {displaySkills.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>등록된 스킬이 없습니다.</p>
            <p className="text-sm mt-1">스킬을 추가하세요.</p>
          </div>
        )}
      </div>

      {/* 스킬 추가/수정 모달 */}
      <Dialog
        open={modalMode === "skill-add" || modalMode === "skill-edit"}
        onOpenChange={() => resetForms()}
      >
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>
              {modalMode === "skill-add" ? "스킬 추가" : "스킬 수정"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>스킬 이름</Label>
              <Input
                value={skillForm.name}
                onChange={(e) =>
                  setSkillForm({ ...skillForm, name: e.target.value })
                }
                placeholder="예: React"
              />
            </div>
            <div>
              <Label>설명</Label>
              <Input
                value={skillForm.description}
                onChange={(e) =>
                  setSkillForm({ ...skillForm, description: e.target.value })
                }
                placeholder="스킬 설명"
              />
            </div>
            <div>
              <Label>최대 레벨</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={skillForm.maxLevel}
                onChange={(e) =>
                  setSkillForm({
                    ...skillForm,
                    maxLevel: parseInt(e.target.value) || 5,
                  })
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={resetForms}>
                취소
              </Button>
              <Button size="sm" onClick={handleSaveSkill}>
                저장
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
