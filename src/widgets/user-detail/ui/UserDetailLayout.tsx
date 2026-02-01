"use client";

import { useQuery } from "@tanstack/react-query";
import { Task, taskApi } from "@/entities/task";
import { LeftPanel } from "./left-panel/LeftPanel";
import { RightPanel } from "./right-panel/RightPanel";

interface UserDetailLayoutProps {
  userId: number;
  userName: string;
}

export const UserDetailLayout = ({
  userId,
  userName,
}: UserDetailLayoutProps) => {
  // 현재 작업을 서버에서 조회
  const { data: currentTask = null } = useQuery({
    queryKey: ["tasks", "current", userId],
    queryFn: () => taskApi.getCurrentTask(userId),
  });

  return (
    <div className="flex h-full w-full">
      {/* 좌측 패널 - 행동 중심 (60%) */}
      <div className="w-[60%] h-full border-r border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <LeftPanel userId={userId} currentTask={currentTask} />
      </div>

      {/* 우측 패널 - 정보 중심 (40%) */}
      <div className="w-[40%] h-full overflow-auto">
        <RightPanel
          userId={userId}
          userName={userName}
          selectedTask={currentTask}
        />
      </div>
    </div>
  );
};
