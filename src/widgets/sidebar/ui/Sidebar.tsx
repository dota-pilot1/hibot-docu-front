"use client";

import { useState, useEffect } from "react";
import { useSidebarStore } from "../model/useSidebarStore";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarOrgTree } from "./SidebarOrgTree";
import { AddDepartmentDialog } from "./AddDepartmentDialog";
import { cn } from "@/shared/lib/utils";
import { useUserStore } from "@/entities/user/model/store";
import type { Department } from "@/features/organization/api/organizationApi";

interface SidebarProps {
  className?: string;
}

export const Sidebar = ({ className }: SidebarProps) => {
  const user = useUserStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [parentDepartment, setParentDepartment] = useState<Department | null>(
    null,
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddDepartment = (parent?: Department | null) => {
    setParentDepartment(parent || null);
    setAddDialogOpen(true);
  };

  // 로그인하지 않은 경우 사이드바 숨김
  if (!mounted || !user) return null;

  return (
    <>
      <div
        className={cn(
          "flex flex-col h-full w-full bg-white dark:bg-zinc-900",
          "overflow-hidden",
          className,
        )}
      >
        <SidebarHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddDepartment={() => handleAddDepartment(null)}
        />
        <SidebarOrgTree
          searchQuery={searchQuery}
          onAddSubDepartment={handleAddDepartment}
        />
      </div>

      {/* 부서 추가 다이얼로그 */}
      <AddDepartmentDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        parentDepartment={parentDepartment}
      />
    </>
  );
};

/** 모바일 사이드바 (오버레이 포함) */
export const MobileSidebar = () => {
  const isOpen = useSidebarStore((state) => state.isOpen);
  const close = useSidebarStore((state) => state.close);
  const user = useUserStore((state) => state.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user) return null;

  return (
    <>
      {/* 모바일 오버레이 */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={close}
      />

      {/* 모바일 사이드바 */}
      <aside
        className={cn(
          "fixed top-12 left-0 h-[calc(100vh-48px)] bg-white dark:bg-zinc-900",
          "border-r border-zinc-200 dark:border-zinc-800",
          "transition-all duration-300 ease-in-out z-40",
          "flex flex-col overflow-hidden",
          "lg:hidden",
          isOpen ? "w-64" : "w-0 -translate-x-full",
        )}
      >
        <Sidebar />
      </aside>
    </>
  );
};
