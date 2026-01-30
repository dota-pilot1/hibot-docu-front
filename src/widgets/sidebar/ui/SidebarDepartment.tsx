"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import { ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react";
import type { Department } from "@/features/organization/api/organizationApi";

interface SidebarDepartmentProps {
  department: Department;
  collapsed?: boolean;
  children?: React.ReactNode;
}

export const SidebarDepartment = ({
  department,
  collapsed,
  children,
}: SidebarDepartmentProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = department.children.length > 0 || department.users.length > 0;
  const userCount = department.users.length +
    department.children.reduce((acc, child) => acc + child.users.length, 0);

  if (collapsed) {
    return (
      <div className="w-full py-1">
        <div
          className="flex items-center justify-center h-8 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
          title={department.name}
        >
          <Folder className="h-4 w-4 text-amber-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        className={cn(
          "flex items-center gap-1 py-1.5 px-2 cursor-pointer rounded-md",
          "hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        )}
        style={{ paddingLeft: `${8 + department.depth * 12}px` }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
          )
        ) : (
          <span className="w-3.5" />
        )}
        {isExpanded ? (
          <FolderOpen className="h-4 w-4 text-amber-500 shrink-0" />
        ) : (
          <Folder className="h-4 w-4 text-amber-500 shrink-0" />
        )}
        <span className="text-sm font-medium truncate flex-1">{department.name}</span>
        {userCount > 0 && (
          <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 rounded">
            {userCount}
          </span>
        )}
      </div>
      {isExpanded && hasChildren && (
        <div className="ml-2">
          {children}
        </div>
      )}
    </div>
  );
};
