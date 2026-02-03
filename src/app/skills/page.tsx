"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/entities/user/model/store";
import { SkillUserSidebar } from "@/features/skill-management/ui/SkillUserSidebar";
import { SkillMainContent } from "@/features/skill-management/ui/SkillMainContent";
import {
  useSkillTabStore,
  hydrateSkillTabStore,
} from "@/features/skill-management/model/useSkillTabStore";

export default function SkillsPage() {
  const currentUser = useUserStore((state) => state.user);
  const panels = useSkillTabStore((state) => state.panels);
  const openTab = useSkillTabStore((state) => state.openTab);
  const [isMounted, setIsMounted] = useState(false);

  // 클라이언트 마운트 확인 및 localStorage에서 상태 복원
  useEffect(() => {
    hydrateSkillTabStore();
    setIsMounted(true);
  }, []);

  // 초기에 현재 로그인한 사용자를 탭에 추가 (탭이 없을 경우)
  useEffect(() => {
    const hasAnyTabs = panels.some((p) => p.tabs.length > 0);
    if (currentUser && !hasAnyTabs && isMounted) {
      openTab({
        id: currentUser.userId,
        name: currentUser.name || undefined,
        email: currentUser.email,
      });
    }
  }, [currentUser, panels, isMounted, openTab]);

  const handleSelectUser = (user: {
    id: number;
    name?: string;
    email: string;
  }) => {
    openTab(user);
  };

  // 현재 활성 탭 ID (사이드바 선택 표시용)
  const activePanelId = useSkillTabStore((state) => state.activePanelId);
  const activePanel = panels.find((p) => p.id === activePanelId);
  const selectedUserId = activePanel?.activeTabId ?? undefined;

  // 서버/클라이언트 hydration 불일치 방지
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

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
          selectedUserId={selectedUserId}
          onSelectUser={handleSelectUser}
          currentUserId={currentUser.userId}
        />
      </div>

      {/* 우측: 다중 패널 (탭 헤더 + 본문) */}
      <div className="flex-1">
        <SkillMainContent currentUserId={currentUser.userId} />
      </div>
    </div>
  );
}
