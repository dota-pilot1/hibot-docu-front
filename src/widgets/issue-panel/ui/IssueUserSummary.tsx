"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Task, taskApi, useUserTasks } from "@/entities/task";
import { organizationApi } from "@/features/organization/api/organizationApi";

interface IssueUserSummaryProps {
  task: Task | null;
}

export const IssueUserSummary = ({ task }: IssueUserSummaryProps) => {
  const userId = task?.assigneeId;

  // 전체 유저 목록에서 담당자 찾기
  const { data: users = [] } = useQuery({
    queryKey: ["organization", "users"],
    queryFn: organizationApi.getUsers,
  });

  // 부서 정보 조회
  const { data: deptTree } = useQuery({
    queryKey: ["organization", "departments", "tree"],
    queryFn: organizationApi.getDepartmentTree,
  });

  // 담당자 정보 찾기
  const assignee = useMemo(() => {
    if (!userId) return null;
    return users.find((u) => u.id === userId) || null;
  }, [users, userId]);

  // 담당자의 부서 찾기
  const userDepartment = useMemo(() => {
    if (!userId || !deptTree) return null;

    const findDepartmentByUser = (
      departments: typeof deptTree.departments,
    ): string | null => {
      for (const dept of departments) {
        if (dept.users.some((u) => u.id === userId)) {
          return dept.name;
        }
        if (dept.children.length > 0) {
          const found = findDepartmentByUser(dept.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findDepartmentByUser(deptTree.departments);
  }, [deptTree, userId]);

  // 통계 조회
  const { data: stats } = useQuery({
    queryKey: ["tasks", "stats", userId],
    queryFn: () => taskApi.getUserStats(userId!),
    enabled: !!userId,
  });

  // 담당자의 Task 목록
  const { data: tasks = [] } = useUserTasks(userId || 0);

  // 진행중인 Task 개수
  const inProgressCount = useMemo(() => {
    return tasks.filter((t) => t.status === "in_progress").length;
  }, [tasks]);

  if (!task || !assignee) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-400">
            ?
          </div>
          <div className="flex-1">
            <p className="text-xs text-zinc-500">이슈를 선택하세요</p>
          </div>
        </div>
      </div>
    );
  }

  const displayName = assignee.name || assignee.email.split("@")[0];

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
      <div className="flex items-center gap-3">
        {/* 아바타 + 온라인 상태 */}
        <div className="relative">
          {assignee.profileImage ? (
            <img
              src={assignee.profileImage}
              alt={displayName}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          {/* 온라인 상태 표시 */}
          <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-zinc-800" />
        </div>

        {/* 유저 정보 */}
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{displayName}</h3>
          <p className="text-xs text-zinc-500">
            {userDepartment || "미배정"}
          </p>
        </div>

        {/* 통계 */}
        <div className="text-right">
          <p className="text-xs text-zinc-500">오늘</p>
          <p className="text-sm font-medium">
            <span className="text-green-600">{stats?.todayCompleted ?? 0}</span>
            <span className="text-zinc-400"> / {stats?.todayTotal ?? 0}</span>
          </p>
          {inProgressCount > 0 && (
            <p className="text-xs text-blue-600 mt-0.5">
              진행중 {inProgressCount}건
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
