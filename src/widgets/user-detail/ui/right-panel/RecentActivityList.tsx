"use client";

import { useQuery } from "@tanstack/react-query";
import { taskApi, TaskActivity } from "@/entities/task";

interface RecentActivityListProps {
  userId: number;
}

const activityIcon: Record<string, string> = {
  completed: "✅",
  commented: "💬",
  created: "➕",
  status_changed: "🔄",
  updated: "✏️",
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const RecentActivityList = ({ userId }: RecentActivityListProps) => {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities", userId],
    queryFn: () => taskApi.getUserActivities(userId),
  });

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
      <h3 className="font-semibold text-sm mb-3">최근 활동</h3>

      {isLoading ? (
        <p className="text-xs text-zinc-500">로딩 중...</p>
      ) : activities.length === 0 ? (
        <p className="text-xs text-zinc-500">활동 내역이 없습니다</p>
      ) : (
        <div className="space-y-2">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-2 text-xs py-1"
            >
              <span>{activityIcon[activity.type] || "•"}</span>
              <span className="flex-1 text-zinc-600 dark:text-zinc-400">
                {activity.description}
              </span>
              <span className="text-zinc-400">
                {formatTime(activity.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
