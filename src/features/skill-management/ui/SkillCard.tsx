"use client";

import { useState } from "react";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { SkillWithUserLevel } from "@/entities/skill";
import { skillLevelConfig } from "@/entities/skill";
import { SkillLevelSlider } from "./SkillLevelSlider";

interface SkillCardProps {
  skill: SkillWithUserLevel;
  onLevelChange?: (skillId: number, level: number, notes?: string) => void;
  isUpdating?: boolean;
}

export function SkillCard({
  skill,
  onLevelChange,
  isUpdating,
}: SkillCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [notes, setNotes] = useState(skill.userSkill?.notes || "");
  const [pendingLevel, setPendingLevel] = useState<number | null>(null);

  const currentLevel = skill.userSkill?.level || 0;
  const displayLevel = pendingLevel ?? currentLevel;
  const config = skillLevelConfig[displayLevel] || skillLevelConfig[0];

  const handleLevelChange = (level: number) => {
    setPendingLevel(level);
    onLevelChange?.(skill.id, level, notes || undefined);
    setTimeout(() => setPendingLevel(null), 500);
  };

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
  };

  const handleNotesSave = () => {
    if (notes !== skill.userSkill?.notes) {
      onLevelChange?.(skill.id, currentLevel, notes);
    }
  };

  return (
    <Card
      className={cn(
        "transition-all",
        isUpdating && "opacity-70",
        displayLevel > 0 && "border-l-4",
        displayLevel === 1 && "border-l-red-400",
        displayLevel === 2 && "border-l-orange-400",
        displayLevel === 3 && "border-l-yellow-400",
        displayLevel === 4 && "border-l-green-400",
        displayLevel === 5 && "border-l-blue-400",
      )}
    >
      <CardContent className="p-3">
        <div className="flex flex-col gap-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {skill.iconUrl ? (
                <img src={skill.iconUrl} alt="" className="w-5 h-5" />
              ) : (
                <div className={cn("w-5 h-5 rounded", config.bgColor)} />
              )}
              <span className="font-medium text-sm">{skill.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Level Slider */}
          <SkillLevelSlider
            level={displayLevel}
            maxLevel={skill.maxLevel}
            onChange={handleLevelChange}
            disabled={isUpdating}
          />

          {/* Expanded Content */}
          {isExpanded && (
            <div className="mt-2 space-y-2">
              {skill.description && (
                <p className="text-xs text-muted-foreground">
                  {skill.description}
                </p>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3" />
                  <span>메모</span>
                </div>
                <Textarea
                  value={notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  onBlur={handleNotesSave}
                  placeholder="스킬에 대한 메모를 작성하세요..."
                  className="text-xs min-h-[60px]"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
