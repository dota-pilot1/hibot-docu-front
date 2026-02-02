"use client";

import { useState } from "react";
import { useUpdateTaskDetail } from "@/entities/task/hooks/useTaskDetail";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { taskDifficultyConfig, type TaskDifficulty } from "@/entities/task/model/types";
import { cn } from "@/shared/lib/utils";

interface TaskDetailMetaProps {
  taskId: number;
  estimatedHours?: string;
  actualHours?: string;
  difficulty?: TaskDifficulty;
  progress: number;
  canEdit: boolean;
}

export function TaskDetailMeta({
  taskId,
  estimatedHours,
  actualHours,
  difficulty,
  progress,
  canEdit,
}: TaskDetailMetaProps) {
  const { mutate: updateDetail } = useUpdateTaskDetail(taskId);
  const [localEstimatedHours, setLocalEstimatedHours] = useState(estimatedHours || "");
  const [localActualHours, setLocalActualHours] = useState(actualHours || "");
  const [localProgress, setLocalProgress] = useState(progress);

  const handleEstimatedHoursBlur = () => {
    if (localEstimatedHours !== estimatedHours) {
      updateDetail({ estimatedHours: localEstimatedHours });
    }
  };

  const handleActualHoursBlur = () => {
    if (localActualHours !== actualHours) {
      updateDetail({ actualHours: localActualHours });
    }
  };

  const handleDifficultyChange = (value: string) => {
    updateDetail({ difficulty: value as TaskDifficulty });
  };

  const handleProgressBlur = () => {
    if (localProgress !== progress) {
      const validProgress = Math.max(0, Math.min(100, localProgress));
      updateDetail({ progress: validProgress });
      setLocalProgress(validProgress);
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm flex items-center gap-2">
        📊 메타 정보
      </h4>

      <div className="grid grid-cols-2 gap-4">
        {/* 예상 시간 */}
        <div>
          <label className="text-xs text-gray-600 block mb-1">
            예상 시간
          </label>
          {canEdit ? (
            <div className="flex items-center gap-1">
              <Input
                type="number"
                step="0.5"
                min="0"
                value={localEstimatedHours}
                onChange={(e) => setLocalEstimatedHours(e.target.value)}
                onBlur={handleEstimatedHoursBlur}
                placeholder="0"
                className="h-8 text-sm"
              />
              <span className="text-xs text-gray-500">시간</span>
            </div>
          ) : (
            <p className="text-sm font-medium">
              {estimatedHours ? `${estimatedHours}시간` : "-"}
            </p>
          )}
        </div>

        {/* 실제 시간 */}
        <div>
          <label className="text-xs text-gray-600 block mb-1">
            실제 시간
          </label>
          {canEdit ? (
            <div className="flex items-center gap-1">
              <Input
                type="number"
                step="0.5"
                min="0"
                value={localActualHours}
                onChange={(e) => setLocalActualHours(e.target.value)}
                onBlur={handleActualHoursBlur}
                placeholder="0"
                className="h-8 text-sm"
              />
              <span className="text-xs text-gray-500">시간</span>
            </div>
          ) : (
            <p className="text-sm font-medium">
              {actualHours ? `${actualHours}시간` : "-"}
            </p>
          )}
        </div>

        {/* 난이도 */}
        <div>
          <label className="text-xs text-gray-600 block mb-1">난이도</label>
          {canEdit ? (
            <Select
              value={difficulty || "medium"}
              onValueChange={handleDifficultyChange}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">쉬움</SelectItem>
                <SelectItem value="medium">중간</SelectItem>
                <SelectItem value="hard">어려움</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <p
              className={cn(
                "text-sm font-medium",
                difficulty && taskDifficultyConfig[difficulty]?.color,
              )}
            >
              {difficulty
                ? taskDifficultyConfig[difficulty]?.label
                : "-"}
            </p>
          )}
        </div>

        {/* 진행률 */}
        <div>
          <label className="text-xs text-gray-600 block mb-1">진행률</label>
          {canEdit ? (
            <div className="flex items-center gap-1">
              <Input
                type="number"
                min="0"
                max="100"
                value={localProgress}
                onChange={(e) => setLocalProgress(Number(e.target.value))}
                onBlur={handleProgressBlur}
                className="h-8 text-sm"
              />
              <span className="text-xs text-gray-500">%</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-700 min-w-[2.5rem] text-right">
                {progress}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 시간 비교 (예상 vs 실제) */}
      {estimatedHours && actualHours && !canEdit && (
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">시간 차이:</span>
            <span
              className={cn(
                "font-medium",
                Number(actualHours) > Number(estimatedHours)
                  ? "text-red-600"
                  : "text-green-600",
              )}
            >
              {Number(actualHours) > Number(estimatedHours) ? "+" : ""}
              {(Number(actualHours) - Number(estimatedHours)).toFixed(1)}시간
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
