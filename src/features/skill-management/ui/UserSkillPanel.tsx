"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Loader2, BookOpen, ChevronDown, ChevronRight, User as UserIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useSkillTreeWithUserLevels, useUpdateUserSkill, skillLevelConfig } from "@/entities/skill";
import type { SkillCategoryWithUserLevels, SkillWithUserLevel } from "@/entities/skill";
import { SkillLevelSlider } from "./SkillLevelSlider";
import { toast } from "sonner";

interface UserSkillPanelProps {
  userId: number;
  userName?: string;
  isOwnProfile?: boolean;
}

function SkillItem({
  skill,
  onLevelChange,
  isUpdating,
  canEdit,
}: {
  skill: SkillWithUserLevel;
  onLevelChange?: (skillId: number, level: number) => void;
  isUpdating?: boolean;
  canEdit?: boolean;
}) {
  const level = skill.userSkill?.level || 0;
  const config = skillLevelConfig[level];

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50",
        isUpdating && "opacity-50"
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded flex items-center justify-center text-xs font-bold shrink-0",
          config.bgColor,
          config.color
        )}
      >
        {level}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{skill.name}</p>
      </div>
      {canEdit ? (
        <div className="w-32">
          <SkillLevelSlider
            level={level}
            maxLevel={skill.maxLevel}
            onChange={(newLevel) => onLevelChange?.(skill.id, newLevel)}
            disabled={isUpdating}
            showLabel={false}
          />
        </div>
      ) : (
        <span className={cn("text-xs px-2 py-1 rounded", config.bgColor, config.color)}>
          {config.label}
        </span>
      )}
    </div>
  );
}

function SkillCategoryGroup({
  category,
  onSkillLevelChange,
  updatingSkillId,
  canEdit,
}: {
  category: SkillCategoryWithUserLevels;
  onSkillLevelChange?: (skillId: number, level: number) => void;
  updatingSkillId?: number | null;
  canEdit?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const avgLevel = category.skills.length > 0
    ? Math.round(
        (category.skills.reduce((sum, skill) => sum + (skill.userSkill?.level || 0), 0) /
          category.skills.length) *
          10
      ) / 10
    : 0;

  const activeCount = category.skills.filter(s => (s.userSkill?.level || 0) > 0).length;

  return (
    <div className="border rounded-lg">
      <Button
        variant="ghost"
        className="w-full justify-start p-3 h-auto rounded-t-lg rounded-b-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 w-full">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          {category.color && (
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: category.color }}
            />
          )}
          <span className="font-semibold">{category.name}</span>
          <div className="flex items-center gap-2 ml-auto text-xs text-muted-foreground">
            <span>{activeCount}/{category.skills.length}</span>
            <span>평균 Lv.{avgLevel}</span>
          </div>
        </div>
      </Button>

      {isExpanded && (
        <div className="p-2 pt-0 space-y-1">
          {category.skills.map((skill) => (
            <SkillItem
              key={skill.id}
              skill={skill}
              onLevelChange={onSkillLevelChange}
              isUpdating={updatingSkillId === skill.id}
              canEdit={canEdit}
            />
          ))}
          {category.skills.length === 0 && (
            <p className="text-sm text-muted-foreground p-2">등록된 스킬이 없습니다.</p>
          )}
        </div>
      )}
    </div>
  );
}

export function UserSkillPanel({ userId, userName, isOwnProfile = false }: UserSkillPanelProps) {
  const { data: skillTree, isLoading } = useSkillTreeWithUserLevels(userId);
  const updateUserSkill = useUpdateUserSkill(userId);
  const [updatingSkillId, setUpdatingSkillId] = useState<number | null>(null);

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

  const totalSkills = skillTree?.reduce((sum, cat) => sum + cat.skills.length, 0) || 0;
  const activeSkills = skillTree?.reduce(
    (sum, cat) => sum + cat.skills.filter((s) => (s.userSkill?.level || 0) > 0).length,
    0
  ) || 0;
  const avgLevel = totalSkills > 0
    ? Math.round(
        (skillTree?.reduce(
          (sum, cat) =>
            sum + cat.skills.reduce((s, skill) => s + (skill.userSkill?.level || 0), 0),
          0
        ) || 0) / totalSkills * 10
      ) / 10
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="p-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">{userName || "사용자"}</h2>
              <p className="text-sm text-muted-foreground">
                {activeSkills}/{totalSkills} 스킬 · 평균 Lv.{avgLevel}
              </p>
            </div>
          </div>
          {isOwnProfile && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
              내 프로필
            </span>
          )}
        </div>
      </div>

      {/* 스킬 목록 */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {skillTree?.map((category) => (
          <SkillCategoryGroup
            key={category.id}
            category={category}
            onSkillLevelChange={handleSkillLevelChange}
            updatingSkillId={updatingSkillId}
            canEdit={isOwnProfile}
          />
        ))}

        {(!skillTree || skillTree.length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>등록된 스킬 카테고리가 없습니다.</p>
            <p className="text-sm mt-1">관리자에게 문의하세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
