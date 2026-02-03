"use client";

import { BaseDialog } from "@/shared/ui/dialogs/BaseDialog";
import { TaskIssueList } from "./TaskIssueList";
import { Task } from "@/entities/task";

interface TaskIssueDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TaskIssueDialog = ({
  task,
  open,
  onOpenChange,
}: TaskIssueDialogProps) => {
  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={task?.title || "이슈 내역"}
      description={
        task ? `상태: ${task.status} | 우선순위: ${task.priority}` : undefined
      }
      maxWidth="max-w-4xl"
    >
      <div className="min-h-[300px]">
        <TaskIssueList taskId={task?.id || null} />
      </div>
    </BaseDialog>
  );
};
