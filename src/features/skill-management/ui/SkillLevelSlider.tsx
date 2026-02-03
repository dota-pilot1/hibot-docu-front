"use client";

import { skillLevelConfig } from "@/entities/skill";
import { cn } from "@/shared/lib/utils";

interface SkillLevelSliderProps {
  level: number;
  maxLevel?: number;
  onChange?: (level: number) => void;
  disabled?: boolean;
  showLabel?: boolean;
}

export function SkillLevelSlider({
  level,
  maxLevel = 5,
  onChange,
  disabled = false,
  showLabel = true,
}: SkillLevelSliderProps) {
  const config = skillLevelConfig[level] || skillLevelConfig[0];

  return (
    <div className="flex items-center gap-3 w-full">
      <input
        type="range"
        min={0}
        max={maxLevel}
        step={1}
        value={level}
        disabled={disabled}
        onChange={(e) => onChange?.(parseInt(e.target.value))}
        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
      />
      {showLabel && (
        <div className="flex items-center gap-2 min-w-[80px]">
          <span className={cn("text-sm font-medium", config.color)}>
            Lv.{level}
          </span>
          <span
            className={cn(
              "text-xs px-1.5 py-0.5 rounded",
              config.bgColor,
              config.color,
            )}
          >
            {config.label}
          </span>
        </div>
      )}
    </div>
  );
}
