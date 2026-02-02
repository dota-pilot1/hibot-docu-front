"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { taskApi, TaskActivity } from "@/entities/task";

const activityIcon: Record<string, string> = {
  completed: "✅",
  commented: "💬",
  created: "➕",
  status_changed: "🔄",
  updated: "✏️",
  issue_created: "💬",
  issue_resolved: "✅",
  current_task_set: "🔥",
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function HistoryPage() {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    number | null
  >(null);

  // 부서별 오늘 활동 수 요약
  const { data: summary = [], isLoading: isSummaryLoading } = useQuery({
    queryKey: ["departmentActivitySummary"],
    queryFn: () => taskApi.getDepartmentActivitySummaryToday(),
    refetchInterval: 30000,
  });

  // 선택된 부서의 오늘 활동 목록
  const { data: activities = [], isLoading: isActivitiesLoading } = useQuery({
    queryKey: ["departmentActivities", selectedDepartmentId],
    queryFn: () =>
      selectedDepartmentId
        ? taskApi.getDepartmentActivitiesToday(selectedDepartmentId)
        : Promise.resolve([]),
    enabled: selectedDepartmentId !== null,
    refetchInterval: 30000,
  });

  const handleDepartmentClick = (departmentId: number) => {
    setSelectedDepartmentId((prev) =>
      prev === departmentId ? null : departmentId,
    );
  };

  // 총 활동 수 계산
  const totalCount = summary.reduce((acc, dept) => acc + dept.count, 0);

  return (
    <div className="h-full p-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-lg font-semibold">팀별 히스토리</h1>
          <p className="text-sm text-zinc-500 mt-1">
            오늘 전체 활동: {totalCount}건
          </p>
        </div>

        {/* 팀 버튼들 */}
        <div className="mb-6">
          {isSummaryLoading ? (
            <p className="text-sm text-zinc-500">로딩 중...</p>
          ) : summary.length === 0 ? (
            <p className="text-sm text-zinc-500">오늘 활동이 없습니다</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {summary.map((dept) => (
                <button
                  key={dept.departmentId}
                  onClick={() => handleDepartmentClick(dept.departmentId)}
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    selectedDepartmentId === dept.departmentId
                      ? "bg-primary text-white border-primary"
                      : "border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  }`}
                >
                  {dept.departmentName} ({dept.count})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 활동 목록 */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
          {selectedDepartmentId === null ? (
            <div className="p-8 text-center text-zinc-500">
              팀을 선택하면 오늘 활동 내역을 확인할 수 있습니다
            </div>
          ) : isActivitiesLoading ? (
            <div className="p-8 text-center text-zinc-500">로딩 중...</div>
          ) : activities.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              오늘 활동이 없습니다
            </div>
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
                >
                  <span className="text-lg">
                    {activityIcon[activity.type] || "•"}
                  </span>
                  <p className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">
                    {activity.description}
                  </p>
                  <span className="text-xs text-zinc-400 shrink-0">
                    {formatTime(activity.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
