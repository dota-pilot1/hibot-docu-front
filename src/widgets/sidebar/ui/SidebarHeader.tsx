"use client";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { PanelLeftClose, PanelLeft, Search, Users, Plus } from "lucide-react";
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
    <div className="px-3 py-3 border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between mb-2">
        {isOpen && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-zinc-500" />
            <span className="font-semibold text-sm">HiBot Team</span>
          </div>
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

      {isOpen && (
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="사용자 검색..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      )}
    </div>
  );
};
