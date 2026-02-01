"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { taskApi, TaskActivity } from "@/entities/task";

interface DepartmentActivityPanelProps {
  className?: string;
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

export const DepartmentActivityPanel = ({
  className = "",
}: DepartmentActivityPanelProps) => {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    number | null
  >(null);

  // 부서별 오늘 활동 수 요약
  const { data: summary = [], isLoading: isSummaryLoading } = useQuery({
    queryKey: ["departmentActivitySummary"],
    queryFn: () => taskApi.getDepartmentActivitySummaryToday(),
    refetchInterval: 30000, // 30초마다 갱신
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
      prev === departmentId ? null : departmentId
    );
  };

  return (
    <div
      className={`flex flex-col bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 ${className}`}
    >
      {/* 헤더 */}
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-700">
        <h3 className="font-semibold text-sm">팀별 히스토리 (오늘)</h3>
      </div>

      {/* 팀 버튼들 */}
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-700">
        {isSummaryLoading ? (
          <p className="text-xs text-zinc-500">로딩 중...</p>
        ) : summary.length === 0 ? (
          <p className="text-xs text-zinc-500">오늘 활동이 없습니다</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {summary.map((dept) => (
              <button
                key={dept.departmentId}
                onClick={() => handleDepartmentClick(dept.departmentId)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                  selectedDepartmentId === dept.departmentId
                    ? "bg-primary text-white border-primary"
                    : "border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                }`}
              >
                {dept.departmentName}({dept.count})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 활동 목록 */}
      <div className="flex-1 overflow-y-auto p-3">
        {selectedDepartmentId === null ? (
          <p className="text-xs text-zinc-500 text-center py-4">
            팀을 선택하세요
          </p>
        ) : isActivitiesLoading ? (
          <p className="text-xs text-zinc-500">로딩 중...</p>
        ) : activities.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-4">
            오늘 활동이 없습니다
          </p>
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
                <span className="text-zinc-400 shrink-0">
                  {formatTime(activity.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
