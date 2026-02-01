"use client";

import { useQuery } from "@tanstack/react-query";
import { taskApi } from "@/entities/task";

interface UserSummaryCompactProps {
  userId: number;
  userName: string;
}

export const UserSummaryCompact = ({
  userId,
  userName,
}: UserSummaryCompactProps) => {
  const { data: stats } = useQuery({
    queryKey: ["tasks", "stats", userId],
    queryFn: () => taskApi.getUserStats(userId),
  });

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
      <div className="flex items-center gap-3">
        {/* 아바타 + 온라인 상태 */}
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
            {userName.charAt(0).toUpperCase()}
          </div>
          {/* 온라인 상태 표시 */}
          <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-zinc-800" />
        </div>

        {/* 유저 정보 */}
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{userName}</h3>
          <p className="text-xs text-zinc-500">백엔드 개발팀</p>
        </div>

        {/* 통계 */}
        <div className="text-right">
          <p className="text-xs text-zinc-500">오늘</p>
          <p className="text-sm font-medium">
            <span className="text-green-600">{stats?.todayCompleted ?? 0}</span>
            <span className="text-zinc-400"> / {stats?.todayTotal ?? 0}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
