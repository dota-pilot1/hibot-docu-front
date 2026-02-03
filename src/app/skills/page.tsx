"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/entities/user/model/store";
import { SkillUserSidebar } from "@/features/skill-management/ui/SkillUserSidebar";
import { UserSkillPanel } from "@/features/skill-management/ui/UserSkillPanel";
import { SkillActivityList } from "@/features/skill-management";

interface SelectedUser {
  id: number;
  name?: string;
  email: string;
}

export default function SkillsPage() {
  const currentUser = useUserStore((state) => state.user);
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);

  // 초기에 현재 로그인한 사용자 선택
  useEffect(() => {
    if (currentUser && !selectedUser) {
      setSelectedUser({
        id: currentUser.userId,
        name: currentUser.name || undefined,
        email: currentUser.email,
      });
    }
  }, [currentUser, selectedUser]);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">로그인이 필요합니다.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* 좌측: 부서별 사용자 목록 */}
      <div className="w-64 shrink-0">
        <SkillUserSidebar
          selectedUserId={selectedUser?.id}
          onSelectUser={(user) =>
            setSelectedUser({ id: user.id, name: user.name, email: user.email })
          }
          currentUserId={currentUser.userId}
        />
      </div>

      {/* 우측: 선택한 사용자의 스킬 정보 */}
      <div className="flex-1 flex">
        {selectedUser ? (
          <>
            {/* 스킬 목록 */}
            <div className="flex-1 border-r">
              <UserSkillPanel
                userId={selectedUser.id}
                userName={selectedUser.name || selectedUser.email.split("@")[0]}
                isOwnProfile={selectedUser.id === currentUser.userId}
              />
            </div>

            {/* 활동 기록 */}
            <div className="w-80 shrink-0 p-4 overflow-auto bg-muted/30">
              <SkillActivityList userId={selectedUser.id} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>사용자를 선택하세요</p>
          </div>
        )}
      </div>
    </div>
  );
}
