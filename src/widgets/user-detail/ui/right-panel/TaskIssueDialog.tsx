"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col rounded-lg">
        <DialogHeader className="px-0 pt-0 pb-4 border-b-0 bg-transparent">
          <DialogTitle>{task?.title || "이슈 내역"}</DialogTitle>
          {task && (
            <p className="text-xs text-zinc-500">
              상태: {task.status} | 우선순위: {task.priority}
            </p>
          )}
        </DialogHeader>
        <div className="flex-1 overflow-y-auto min-h-[300px]">
          <TaskIssueList taskId={task?.id || null} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
