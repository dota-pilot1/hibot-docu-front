"use client";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { PanelLeftClose, PanelLeft, Search, Users } from "lucide-react";
import { useSidebarStore } from "../model/useSidebarStore";
import { cn } from "@/shared/lib/utils";

interface SidebarHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const SidebarHeader = ({
  searchQuery,
  onSearchChange,
}: SidebarHeaderProps) => {
  const { isOpen, toggle } = useSidebarStore();

  return (
    <div className="px-3 py-3 border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between mb-2">
        {isOpen && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-zinc-500" />
            <span className="font-semibold text-sm">조직도</span>
          </div>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={toggle}
          className={cn("h-8 w-8", !isOpen && "mx-auto")}
        >
          {isOpen ? (
            <PanelLeftClose className="h-6 w-6" />
          ) : (
            <PanelLeft className="h-6 w-6" />
          )}
        </Button>
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
