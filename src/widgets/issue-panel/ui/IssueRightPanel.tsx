"use client";

import { Task } from "@/entities/task";
import { IssueUserSummary } from "./IssueUserSummary";
import { IssueTaskCard } from "./IssueTaskCard";

interface IssueRightPanelProps {
  selectedTask: Task | null;
}

export const IssueRightPanel = ({ selectedTask }: IssueRightPanelProps) => {
  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-auto">
      {/* 담당자 요약 */}
      <IssueUserSummary task={selectedTask} />

      {/* 현재 작업 + 업무 상세 */}
      <IssueTaskCard task={selectedTask} />
    </div>
  );
};
