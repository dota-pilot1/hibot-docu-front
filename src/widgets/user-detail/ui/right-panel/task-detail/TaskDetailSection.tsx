"use client";

import { useTaskDetail } from "@/entities/task/hooks/useTaskDetail";
import { TaskDetailEditor } from "./TaskDetailEditor";
import { TaskDetailMeta } from "./TaskDetailMeta";
import { TaskDetailImages } from "./TaskDetailImages";
import { TaskDetailChecklist } from "./TaskDetailChecklist";
import { TaskDetailLinks } from "./TaskDetailLinks";
import { TaskDetailAttachments } from "./TaskDetailAttachments";
import { TaskDetailFigma } from "./TaskDetailFigma";
import { Loader2 } from "lucide-react";

interface TaskDetailSectionProps {
  taskId: number;
  startedAt?: string;
  dueDate?: string;
}

export function TaskDetailSection({
  taskId,
  startedAt,
  dueDate,
}: TaskDetailSectionProps) {
  const { data: detail, isLoading } = useTaskDetail(taskId);

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
      {/* 일정 정보 */}
      <TaskDetailMeta startedAt={startedAt} dueDate={dueDate} />

      {/* 상세 설명 (Markdown) */}
      <TaskDetailEditor taskId={taskId} value={detail.description || ""} />

      {/* 피그마 */}
      {detail.figmaUrl && <TaskDetailFigma url={detail.figmaUrl} />}

      {/* 이미지 */}
      <TaskDetailImages taskId={taskId} images={detail.images || []} />

      {/* 첨부파일 */}
      <TaskDetailAttachments
        taskId={taskId}
        attachments={detail.attachments || []}
      />

      {/* 관련 링크 */}
      <TaskDetailLinks taskId={taskId} links={detail.links || []} />

      {/* 체크리스트 */}
      <TaskDetailChecklist taskId={taskId} checklist={detail.checklist || []} />
    </div>
  );
}
