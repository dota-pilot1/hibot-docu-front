"use client";

import { Folder } from "lucide-react";
import type { Department } from "@/features/organization/api/organizationApi";

interface DepartmentDragPreviewProps {
  department: Department;
}

export const DepartmentDragPreview = ({ department }: DepartmentDragPreviewProps) => {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700">
      <Folder className="h-4 w-4 text-amber-500" />
      <span className="text-sm font-medium">{department.name}</span>
    </div>
  );
};
