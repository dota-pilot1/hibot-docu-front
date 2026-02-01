"use client";

import { UserSummaryCompact } from "./UserSummaryCompact";
import { CurrentTaskCard } from "./CurrentTaskCard";
import { RecentActivityList } from "./RecentActivityList";
import { PersonalMemo } from "./PersonalMemo";

interface RightPanelProps {
  userId: number;
  userName: string;
}

export const RightPanel = ({ userId, userName }: RightPanelProps) => {
  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-auto">
      {/* 유저 요약 */}
      <UserSummaryCompact userId={userId} userName={userName} />

      {/* 현재 작업 */}
      <CurrentTaskCard />

      {/* 최근 활동 */}
      <RecentActivityList userId={userId} />

      {/* 개인 메모 */}
      <PersonalMemo userId={userId} />
    </div>
  );
};
