"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSidebarStore } from "../model/useSidebarStore";
import { Sidebar, MobileSidebar } from "./Sidebar";
import { useUserStore } from "@/entities/user/model/store";
import { cn } from "@/shared/lib/utils";
import { MainContent } from "./MainContent";
import { DocumentLayout } from "@/widgets/document-layout";
import { ChatLayout } from "@/widgets/chat-layout";

interface ResizableLayoutProps {
  children: React.ReactNode;
}

const DEFAULT_SIDEBAR_WIDTH = 256; // 16rem = 256px
const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 400;

export const ResizableLayout = ({ children }: ResizableLayoutProps) => {
  const pathname = usePathname();
  const isOpen = useSidebarStore((state) => state.isOpen);
  const sidebarSize = useSidebarStore((state) => state.sidebarSize);
  const setSidebarSize = useSidebarStore((state) => state.setSidebarSize);
  const user = useUserStore((state) => state.user);
  const [mounted, setMounted] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // /tasks 경로에서만 MainContent(탭/패널 UI) 사용
  const isTasksPage = pathname === "/tasks" || pathname === "/tasks/";
  // /documents 경로에서는 DocumentLayout 사용
  const isDocumentsPage =
    pathname === "/documents" || pathname?.startsWith("/documents/");
  // /chats 경로에서는 ChatLayout 사용
  const isChatsPage = pathname === "/chats" || pathname?.startsWith("/chats/");

  useEffect(() => {
    setMounted(true);
  }, []);

  // sidebarSize를 픽셀로 사용 (기존 %에서 px로 변환)
  const sidebarWidth =
    sidebarSize >= MIN_SIDEBAR_WIDTH && sidebarSize <= MAX_SIDEBAR_WIDTH
      ? sidebarSize
      : DEFAULT_SIDEBAR_WIDTH;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      // requestAnimationFrame으로 렉 최소화
      requestAnimationFrame(() => {
        const newWidth = e.clientX;
        if (newWidth >= MIN_SIDEBAR_WIDTH && newWidth <= MAX_SIDEBAR_WIDTH) {
          if (sidebarRef.current) {
            sidebarRef.current.style.width = `${newWidth}px`;
          }
        }
      });
    },
    [isResizing],
  );

  // 드래그 끝날 때 store에 저장
  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (sidebarRef.current) {
        const finalWidth = parseInt(sidebarRef.current.style.width, 10);
        if (
          finalWidth >= MIN_SIDEBAR_WIDTH &&
          finalWidth <= MAX_SIDEBAR_WIDTH
        ) {
          setSidebarSize(finalWidth);
        }
      }
      setIsResizing(false);
    },
    [setSidebarSize],
  );

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // 로그인하지 않은 경우 사이드바 없이 렌더링
  if (!mounted || !user) {
    return (
      <main className="flex-1 bg-[#F8F9FA] dark:bg-zinc-950">{children}</main>
    );
  }

  // /documents 경로에서는 전용 레이아웃 사용 (기존 사이드바 제외)
  if (isDocumentsPage) {
    return (
      <main className="flex-1 bg-[#F8F9FA] dark:bg-zinc-950 overflow-hidden">
        <DocumentLayout />
      </main>
    );
  }

  // /chats 경로에서는 전용 레이아웃 사용 (기존 사이드바 제외)
  if (isChatsPage) {
    return (
      <main className="flex-1 bg-[#F8F9FA] dark:bg-zinc-950 overflow-hidden">
        <ChatLayout />
      </main>
    );
  }

  return (
    <>
      {/* 모바일 사이드바 (오버레이) */}
      <MobileSidebar />

      {/* 데스크톱 레이아웃 */}
      <div className="hidden lg:flex flex-1 overflow-hidden">
        {/* 사이드바 */}
        <div
          ref={sidebarRef}
          className={cn(
            "h-full border-r border-zinc-200 dark:border-zinc-800 shrink-0",
            !isResizing && "transition-all duration-300 ease-in-out",
          )}
          style={{ width: isOpen ? sidebarWidth : 64 }}
        >
          <Sidebar />
        </div>

        {/* 리사이즈 핸들 (열려있을 때만) */}
        {isOpen && (
          <div
            className={cn(
              "w-1 h-full cursor-col-resize shrink-0",
              "bg-zinc-200 dark:bg-zinc-700",
              "hover:bg-blue-400 dark:hover:bg-blue-500",
              "transition-colors",
              isResizing && "bg-blue-400 dark:bg-blue-500",
            )}
            onMouseDown={handleMouseDown}
          />
        )}

        {/* 메인 콘텐츠 */}
        <main className="flex-1 bg-[#F8F9FA] dark:bg-zinc-950 overflow-auto">
          {isTasksPage ? <MainContent /> : children}
        </main>
      </div>

      {/* 모바일: 메인 콘텐츠만 */}
      <main className="flex-1 lg:hidden bg-[#F8F9FA] dark:bg-zinc-950 overflow-auto">
        {isTasksPage ? <MainContent /> : children}
      </main>
    </>
  );
};
