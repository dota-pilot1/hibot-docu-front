"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import type { SkillCategoryWithUserLevels } from "@/entities/skill";
import { SkillCard } from "./SkillCard";

interface SkillCategorySectionProps {
  category: SkillCategoryWithUserLevels;
  onSkillLevelChange?: (skillId: number, level: number, notes?: string) => void;
  updatingSkillId?: number | null;
}

export function SkillCategorySection({
  category,
  onSkillLevelChange,
  updatingSkillId,
}: SkillCategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const avgLevel =
    category.skills.length > 0
      ? Math.round(
          (category.skills.reduce(
            (sum, skill) => sum + (skill.userSkill?.level || 0),
            0,
          ) /
            category.skills.length) *
            10,
        ) / 10
      : 0;

  const activeSkillCount = category.skills.filter(
    (skill) => skill.userSkill && skill.userSkill.level > 0,
  ).length;

  return (
    <div className="space-y-2">
      <Button
        variant="ghost"
        className="w-full justify-start p-2 h-auto"
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
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: category.color }}
            />
          )}

          <span className="font-semibold">{category.name}</span>

          <div className="flex items-center gap-2 ml-auto text-xs text-muted-foreground">
            <span>
              {activeSkillCount}/{category.skills.length} 학습중
            </span>
            <span className="text-muted-foreground">|</span>
            <span>평균 Lv.{avgLevel}</span>
          </div>
        </div>
      </Button>

      {isExpanded && (
        <div className="grid gap-2 pl-6">
          {category.skills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onLevelChange={onSkillLevelChange}
              isUpdating={updatingSkillId === skill.id}
            />
          ))}

          {category.skills.length === 0 && (
            <p className="text-sm text-muted-foreground py-2">
              등록된 스킬이 없습니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
