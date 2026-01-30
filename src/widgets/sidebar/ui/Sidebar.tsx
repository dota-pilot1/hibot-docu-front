"use client";

import { useState, useEffect } from "react";
import { useSidebarStore } from "../model/useSidebarStore";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarUserList } from "./SidebarUserList";
import { cn } from "@/shared/lib/utils";
import { useUserStore } from "@/entities/user/model/store";

export const Sidebar = () => {
  const isOpen = useSidebarStore((state) => state.isOpen);
  const close = useSidebarStore((state) => state.close);
  const user = useUserStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 로그인하지 않은 경우 사이드바 숨김
  if (!mounted || !user) return null;

  return (
    <>
      {/* 모바일 오버레이 */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={close}
      />

      {/* 사이드바 */}
      <aside
        className={cn(
          "fixed top-12 left-0 h-[calc(100vh-48px)] bg-white dark:bg-zinc-900",
          "border-r border-zinc-200 dark:border-zinc-800",
          "transition-all duration-300 ease-in-out z-40",
          "flex flex-col overflow-hidden",
          // 데스크톱: 항상 표시
          "lg:relative lg:top-0 lg:h-full lg:z-0",
          isOpen ? "w-64" : "w-0 lg:w-16",
          // 모바일: 숨김
          !isOpen && "max-lg:-translate-x-full"
        )}
      >
        <SidebarHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <SidebarUserList searchQuery={searchQuery} />
      </aside>
    </>
  );
};
