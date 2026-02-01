"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { taskApi, taskStatusConfig } from "@/entities/task";
import { organizationApi } from "@/features/organization/api/organizationApi";
import { cn } from "@/shared/lib/utils";
import { ExternalLink } from "lucide-react";

interface AllTasksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserTaskSummary {
  userId: number;
  userName: string;
  total: number;
  inProgress: number;
  pending: number;
  completed: number;
  currentTask?: string;
}

export const AllTasksDialog = ({ open, onOpenChange }: AllTasksDialogProps) => {
  const router = useRouter();

  // 전체 Task 조회
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", "all"],
    queryFn: () => taskApi.getAll(),
    enabled: open,
  });

  // 전체 유저 조회
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => organizationApi.getUsers(),
    enabled: open,
  });

  // 담당자별 요약 데이터
  const summaryData = useMemo<UserTaskSummary[]>(() => {
    const userMap = new Map<number, UserTaskSummary>();

    // 유저 초기화
    users.forEach((user) => {
      userMap.set(user.id, {
        userId: user.id,
        userName: user.name || user.email.split("@")[0],
        total: 0,
        inProgress: 0,
        pending: 0,
        completed: 0,
      });
    });

    // Task 집계
    tasks.forEach((task) => {
      const summary = userMap.get(task.assigneeId);
      if (summary) {
        summary.total++;
        if (task.status === "in_progress") summary.inProgress++;
        else if (task.status === "pending") summary.pending++;
        else if (task.status === "completed") summary.completed++;

        if (task.isCurrent) {
          summary.currentTask = task.title;
        }
      }
    });

    return Array.from(userMap.values()).filter((s) => s.total > 0);
  }, [tasks, users]);

  // 전체 통계
  const totalStats = useMemo(() => {
    return {
      total: tasks.length,
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      pending: tasks.filter((t) => t.status === "pending").length,
      completed: tasks.filter((t) => t.status === "completed").length,
    };
  }, [tasks]);

  const handleGoToTasks = () => {
    onOpenChange(false);
    router.push("/tasks");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] p-5">
        <DialogHeader className="pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base">담당자별 업무 요약</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoToTasks}
              className="h-7 px-2 text-xs text-zinc-500 hover:text-zinc-900"
            >
              전체 목록 <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </DialogHeader>

        {/* 전체 통계 */}
        <div className="flex gap-3 mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
          <StatBadge label="전체" count={totalStats.total} />
          <StatBadge
            label="진행중"
            count={totalStats.inProgress}
            color="text-green-600"
          />
          <StatBadge
            label="대기"
            count={totalStats.pending}
            color="text-yellow-600"
          />
          <StatBadge
            label="완료"
            count={totalStats.completed}
            color="text-zinc-400"
          />
        </div>

        {/* 담당자별 목록 */}
        <div className="space-y-2 max-h-[360px] overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-20 text-zinc-500 text-sm">
              로딩 중...
            </div>
          ) : summaryData.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-zinc-500 text-sm">
              업무가 없습니다.
            </div>
          ) : (
            summaryData.map((summary) => (
              <UserSummaryRow key={summary.userId} summary={summary} />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const StatBadge = ({
  label,
  count,
  color = "text-zinc-700",
}: {
  label: string;
  count: number;
  color?: string;
}) => (
  <div className="flex items-center gap-1.5">
    <span className="text-xs text-zinc-500">{label}</span>
    <span className={cn("text-sm font-semibold", color)}>{count}</span>
  </div>
);

const UserSummaryRow = ({ summary }: { summary: UserTaskSummary }) => {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{summary.userName}</span>
          {summary.currentTask && (
            <span className="text-xs text-green-600 truncate max-w-[200px]">
              ● {summary.currentTask}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs">
        <span className="text-zinc-500">
          <span className="text-green-600 font-medium">
            {summary.inProgress}
          </span>
          {" / "}
          <span className="text-yellow-600 font-medium">{summary.pending}</span>
          {" / "}
          <span className="text-zinc-400 font-medium">{summary.completed}</span>
        </span>
        <span className="text-zinc-400 w-8 text-right">{summary.total}건</span>
      </div>
    </div>
  );
};
