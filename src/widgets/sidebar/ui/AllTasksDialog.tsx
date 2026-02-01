"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  Task,
  taskApi,
  taskStatusConfig,
  taskPriorityConfig,
} from "@/entities/task";
import { organizationApi } from "@/features/organization/api/organizationApi";
import { cn } from "@/shared/lib/utils";

interface AllTasksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AllTasksDialog = ({ open, onOpenChange }: AllTasksDialogProps) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // 전체 Task 조회
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", "all"],
    queryFn: () => taskApi.getAll(),
    enabled: open,
  });

  // 전체 유저 조회 (assignee 이름 표시용)
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => organizationApi.getUsers(),
    enabled: open,
  });

  // 유저 ID -> 이름 맵
  const userMap = useMemo(() => {
    const map = new Map<number, string>();
    users.forEach((user) => {
      map.set(user.id, user.name || user.email.split("@")[0]);
    });
    return map;
  }, [users]);

  // 필터링된 Task
  const filteredTasks = useMemo(() => {
    if (statusFilter === "all") return tasks;
    return tasks.filter((task) => task.status === statusFilter);
  }, [tasks, statusFilter]);

  const filters = [
    { key: "all", label: "전체" },
    { key: "in_progress", label: "진행중" },
    { key: "pending", label: "대기" },
    { key: "completed", label: "완료" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>전체 업무 목록</DialogTitle>
        </DialogHeader>

        {/* 필터 */}
        <div className="flex gap-1 mb-4">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={cn(
                "px-3 py-1 text-xs rounded-full border transition-colors",
                statusFilter === f.key
                  ? "bg-primary text-white border-primary"
                  : "border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Task 목록 */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32 text-zinc-500">
              로딩 중...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-zinc-500">
              업무가 없습니다.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800 sticky top-0">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">제목</th>
                  <th className="text-left px-3 py-2 font-medium w-24">
                    담당자
                  </th>
                  <th className="text-left px-3 py-2 font-medium w-20">상태</th>
                  <th className="text-left px-3 py-2 font-medium w-24">
                    우선순위
                  </th>
                  <th className="text-left px-3 py-2 font-medium w-28">기한</th>
                  <th className="text-center px-3 py-2 font-medium w-16">
                    현재
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    assigneeName={userMap.get(task.assigneeId) || "-"}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface TaskRowProps {
  task: Task;
  assigneeName: string;
}

const TaskRow = ({ task, assigneeName }: TaskRowProps) => {
  const statusConfig = taskStatusConfig[task.status];
  const priorityConfig = taskPriorityConfig[task.priority];

  return (
    <tr className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
      <td className="px-3 py-2">{task.title}</td>
      <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
        {assigneeName}
      </td>
      <td className="px-3 py-2">
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-xs",
            statusConfig.bgColor,
            statusConfig.color,
          )}
        >
          {statusConfig.label}
        </span>
      </td>
      <td className="px-3 py-2">
        <span className={cn("text-sm", priorityConfig.color)}>
          {priorityConfig.icon} {priorityConfig.label}
        </span>
      </td>
      <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
        {task.dueDate
          ? new Date(task.dueDate).toLocaleDateString("ko-KR")
          : "-"}
      </td>
      <td className="px-3 py-2 text-center">
        {task.isCurrent && <span className="text-green-600 font-bold">✓</span>}
      </td>
    </tr>
  );
};
