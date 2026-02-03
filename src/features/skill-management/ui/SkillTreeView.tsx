"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Loader2, GitBranch } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useSkillTreeWithUserLevels, skillLevelConfig } from "@/entities/skill";
import type { SkillWithUserLevel } from "@/entities/skill";

interface SkillTreeViewProps {
  userId: number;
}

function SkillNode({
  skill,
  depth = 0,
}: {
  skill: SkillWithUserLevel;
  depth?: number;
}) {
  const level = skill.userSkill?.level || 0;
  const config = skillLevelConfig[level];

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors",
        depth > 0 && "ml-4 border-l-2 border-muted pl-4",
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
          config.bgColor,
          config.color,
        )}
      >
        {level}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{skill.name}</p>
        {skill.description && (
          <p className="text-xs text-muted-foreground truncate">
            {skill.description}
          </p>
        )}
      </div>
      <Badge variant="outline" className={cn("text-xs", config.color)}>
        {config.label}
      </Badge>
    </div>
  );
}

export function SkillTreeView({ userId }: SkillTreeViewProps) {
  const { data: skillTree, isLoading } = useSkillTreeWithUserLevels(userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const levelStats = [0, 1, 2, 3, 4, 5].map((level) => {
    const count =
      skillTree?.reduce(
        (sum, cat) =>
          sum +
          cat.skills.filter((s) => (s.userSkill?.level || 0) === level).length,
        0,
      ) || 0;
    return { level, count };
  });

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <GitBranch className="h-5 w-5" />
          스킬 트리
        </CardTitle>
        <div className="flex gap-1 mt-2 flex-wrap">
          {levelStats.map(({ level, count }) => {
            const config = skillLevelConfig[level];
            if (count === 0) return null;
            return (
              <div
                key={level}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded text-xs",
                  config.bgColor,
                  config.color,
                )}
              >
                <span className="font-medium">Lv.{level}</span>
                <span>({count})</span>
              </div>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-4 pt-0">
        <div className="space-y-4">
          {skillTree?.map((category) => (
            <div key={category.id} className="space-y-1">
              <div className="flex items-center gap-2 py-2">
                {category.color && (
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                )}
                <h3 className="font-semibold text-sm">{category.name}</h3>
                <span className="text-xs text-muted-foreground">
                  ({category.skills.length})
                </span>
              </div>
              <div className="space-y-1">
                {category.skills.map((skill) => (
                  <SkillNode key={skill.id} skill={skill} />
                ))}
              </div>
            </div>
          ))}

          {(!skillTree || skillTree.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <p>스킬 트리가 비어 있습니다.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
