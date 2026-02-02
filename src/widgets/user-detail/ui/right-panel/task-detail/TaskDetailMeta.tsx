"use client";

import { cn } from "@/shared/lib/utils";

interface TaskDetailMetaProps {
  startedAt?: string;
  dueDate?: string;
}

export function TaskDetailMeta({ startedAt, dueDate }: TaskDetailMetaProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getRemainingTime = (dueDateStr: string) => {
    const now = new Date();
    const due = new Date(dueDateStr);

    // 시간 부분 제거하고 날짜만 비교
    now.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)}일 지남`, isOverdue: true };
    } else if (diffDays === 0) {
      return { text: "오늘 마감", isOverdue: false, isToday: true };
    } else {
      return { text: `${diffDays}일 남음`, isOverdue: false };
    }
  };

  const remaining = dueDate ? getRemainingTime(dueDate) : null;

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm flex items-center gap-2">📅 일정</h4>

      <div className="grid grid-cols-3 gap-3 text-sm">
        {/* 시작일 */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">시작일</p>
          <p className="font-medium">
            {startedAt ? formatDate(startedAt) : "-"}
          </p>
        </div>

        {/* 마감일 */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">마감일</p>
          <p className="font-medium">{dueDate ? formatDate(dueDate) : "-"}</p>
        </div>

        {/* 남은 시간 */}
        <div
          className={cn(
            "rounded-lg p-3",
            remaining?.isOverdue
              ? "bg-red-50"
              : remaining?.isToday
                ? "bg-yellow-50"
                : "bg-gray-50",
          )}
        >
          <p className="text-xs text-gray-500 mb-1">남은 시간</p>
          <p
            className={cn(
              "font-medium",
              remaining?.isOverdue
                ? "text-red-600"
                : remaining?.isToday
                  ? "text-yellow-600"
                  : "",
            )}
          >
            {remaining?.text || "-"}
          </p>
        </div>
      </div>
    </div>
  );
}
