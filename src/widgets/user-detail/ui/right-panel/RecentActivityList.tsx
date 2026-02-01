"use client";

interface RecentActivityListProps {
  userId: number;
}

// 더미 활동 데이터
const dummyActivities = [
  {
    id: 1,
    type: "completed",
    description: '"DB 스키마 설계" 완료',
    time: "10:30",
  },
  {
    id: 2,
    type: "commented",
    description: "코멘트 추가",
    time: "09:15",
  },
  {
    id: 3,
    type: "created",
    description: '"버그 수정" Task 생성',
    time: "09:00",
  },
  {
    id: 4,
    type: "status_changed",
    description: "상태 변경: 대기 → 진행중",
    time: "08:45",
  },
];

const activityIcon: Record<string, string> = {
  completed: "✅",
  commented: "💬",
  created: "➕",
  status_changed: "🔄",
  updated: "✏️",
};

export const RecentActivityList = ({ userId }: RecentActivityListProps) => {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
      <h3 className="font-semibold text-sm mb-3">최근 활동</h3>

      <div className="space-y-2">
        {dummyActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-2 text-xs py-1"
          >
            <span>{activityIcon[activity.type] || "•"}</span>
            <span className="flex-1 text-zinc-600 dark:text-zinc-400">
              {activity.description}
            </span>
            <span className="text-zinc-400">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
