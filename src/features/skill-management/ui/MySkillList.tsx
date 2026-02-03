"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Loader2, BookOpen } from "lucide-react";
import {
  useSkillTreeWithUserLevels,
  useUpdateUserSkill,
} from "@/entities/skill";
import { SkillCategorySection } from "./SkillCategorySection";
import { toast } from "sonner";

interface MySkillListProps {
  userId: number;
}

export function MySkillList({ userId }: MySkillListProps) {
  const { data: skillTree, isLoading } = useSkillTreeWithUserLevels(userId);
  const updateUserSkill = useUpdateUserSkill(userId);
  const [updatingSkillId, setUpdatingSkillId] = useState<number | null>(null);

  const handleSkillLevelChange = async (
    skillId: number,
    level: number,
    notes?: string,
  ) => {
    setUpdatingSkillId(skillId);
    try {
      await updateUserSkill.mutateAsync({
        skillId,
        data: { level, notes },
      });
      toast.success("스킬 레벨이 업데이트되었습니다.");
    } catch (error) {
      toast.error("스킬 레벨 업데이트에 실패했습니다.");
    } finally {
      setUpdatingSkillId(null);
    }
  };

  const totalSkills =
    skillTree?.reduce((sum, cat) => sum + cat.skills.length, 0) || 0;
  const activeSkills =
    skillTree?.reduce(
      (sum, cat) =>
        sum +
        cat.skills.filter((s) => s.userSkill && s.userSkill.level > 0).length,
      0,
    ) || 0;
  const avgLevel =
    totalSkills > 0
      ? Math.round(
          ((skillTree?.reduce(
            (sum, cat) =>
              sum +
              cat.skills.reduce(
                (s, skill) => s + (skill.userSkill?.level || 0),
                0,
              ),
            0,
          ) || 0) /
            totalSkills) *
            10,
        ) / 10
      : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5" />
            나의 스킬
          </CardTitle>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>
              {activeSkills}/{totalSkills} 학습중
            </span>
            <span>평균 Lv.{avgLevel}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-4 pt-0">
        <div className="space-y-4">
          {skillTree?.map((category) => (
            <SkillCategorySection
              key={category.id}
              category={category}
              onSkillLevelChange={handleSkillLevelChange}
              updatingSkillId={updatingSkillId}
            />
          ))}

          {(!skillTree || skillTree.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <p>등록된 스킬 카테고리가 없습니다.</p>
              <p className="text-sm mt-1">관리자에게 문의하세요.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
