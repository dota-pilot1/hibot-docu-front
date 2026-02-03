"use client";

import { useUserStore } from "@/entities/user/model/store";
import {
  MySkillList,
  SkillTreeView,
  SkillActivityList,
} from "@/features/skill-management";

export default function SkillsPage() {
  const user = useUserStore((state) => state.user);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">로그인이 필요합니다.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex gap-4 p-4">
      {/* Left Panel - 내 스킬 목록 */}
      <div className="flex-1 min-w-0">
        <MySkillList userId={user.userId} />
      </div>

      {/* Right Panel - 스킬 트리 & 활동 */}
      <div className="flex-1 min-w-0 space-y-4 overflow-auto">
        <SkillTreeView userId={user.userId} />
        <SkillActivityList userId={user.userId} />
      </div>
    </div>
  );
}
