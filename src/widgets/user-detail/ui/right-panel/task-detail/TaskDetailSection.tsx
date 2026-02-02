"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { useTaskDetail } from "@/entities/task/hooks/useTaskDetail";
import { TaskDetailEditor } from "./TaskDetailEditor";
import { TaskDetailMeta } from "./TaskDetailMeta";
import { TaskDetailImages } from "./TaskDetailImages";
import { TaskDetailChecklist } from "./TaskDetailChecklist";
import { TaskDetailLinks } from "./TaskDetailLinks";
import { TaskDetailAttachments } from "./TaskDetailAttachments";
import { TaskDetailFigma } from "./TaskDetailFigma";
import { Loader2, Edit3, Check } from "lucide-react";

interface TaskDetailSectionProps {
  taskId: number;
}

export function TaskDetailSection({ taskId }: TaskDetailSectionProps) {
  const { data: detail, isLoading } = useTaskDetail(taskId);
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return (
      <div className="border-t pt-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!detail) {
    return null;
  }

  return (
    <div className="space-y-6 pt-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          📋 업무 상세 설명
        </h3>
        <Button
          variant={isEditing ? "default" : "ghost"}
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              완료
            </>
          ) : (
            <>
              <Edit3 className="h-4 w-4 mr-1" />
              편집
            </>
          )}
        </Button>
      </div>

      {/* 상세 설명 (Markdown) */}
      <TaskDetailEditor
        taskId={taskId}
        value={detail.description || ""}
        isEditing={isEditing}
      />

      {/* 피그마 */}
      {detail.figmaUrl && <TaskDetailFigma url={detail.figmaUrl} />}

      {/* 이미지 */}
      <TaskDetailImages
        taskId={taskId}
        images={detail.images || []}
        canEdit={isEditing}
      />

      {/* 체크리스트 */}
      <TaskDetailChecklist taskId={taskId} checklist={detail.checklist || []} />

      {/* 관련 링크 */}
      <TaskDetailLinks
        taskId={taskId}
        links={detail.links || []}
        canEdit={isEditing}
      />

      {/* 첨부파일 */}
      <TaskDetailAttachments
        taskId={taskId}
        attachments={detail.attachments || []}
        canEdit={isEditing}
      />

      {/* 메타 정보 */}
      <TaskDetailMeta
        taskId={taskId}
        estimatedHours={detail.estimatedHours}
        actualHours={detail.actualHours}
        difficulty={detail.difficulty}
        progress={detail.progress || 0}
        canEdit={isEditing}
      />
    </div>
  );
}
