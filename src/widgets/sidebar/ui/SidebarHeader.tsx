"use client";

import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { PanelLeftClose, PanelLeft, Search, Plus, List } from "lucide-react";
import { useSidebarStore } from "../model/useSidebarStore";
import { useUserStore } from "@/entities/user/model/store";
import { cn } from "@/shared/lib/utils";

interface SidebarHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddDepartment?: () => void;
}

export const SidebarHeader = ({
  searchQuery,
  onSearchChange,
  onAddDepartment,
}: SidebarHeaderProps) => {
  const isOpen = useSidebarStore((state) => state.isOpen);
  const toggle = useSidebarStore((state) => state.toggle);
  const user = useUserStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";

  return (
    <div>
      {/* 헤더 영역 - 탭 헤더와 높이/보더 동일 */}
      <div className="px-3 h-[46px] flex items-center justify-between bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        {isOpen && (
          <Link href="/tasks/all">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 gap-1.5"
              title="전체 업무 목록"
            >
              <List className="h-4 w-4" />
              <span className="text-sm font-medium">전체 업무</span>
            </Button>
          </Link>
        )}
        <div className={cn("flex items-center gap-1", !isOpen && "mx-auto")}>
          {isOpen && isAdmin && onAddDepartment && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onAddDepartment}
              className="h-7 w-7"
              title="부서 추가"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="h-7 w-7"
          >
            {isOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* 검색창 영역 */}
      {isOpen && (
        <div className="px-3 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="사용자 검색..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
};
