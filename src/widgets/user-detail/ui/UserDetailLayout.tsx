"use client";

import { useState } from "react";
import { Task } from "@/entities/task";
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
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  return (
    <div className="flex h-full w-full">
      {/* 좌측 패널 - 행동 중심 (60%) */}
      <div className="w-[60%] h-full border-r border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <LeftPanel
          userId={userId}
          currentTask={selectedTask}
          onTaskSelect={setSelectedTask}
        />
      </div>

      {/* 우측 패널 - 정보 중심 (40%) */}
      <div className="w-[40%] h-full overflow-auto">
        <RightPanel
          userId={userId}
          userName={userName}
          selectedTask={selectedTask}
        />
      </div>
    </div>
  );
};
