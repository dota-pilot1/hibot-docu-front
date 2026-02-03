"use client";

import { Table, Kanban, GanttChart } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export type ViewType = "table" | "kanban" | "gantt";

interface ViewToggleProps {
  view: ViewType;
  onViewChange: (view: ViewType) => void;
}

const views = [
  { id: "table" as const, label: "테이블", icon: Table },
  { id: "kanban" as const, label: "칸반", icon: Kanban },
  { id: "gantt" as const, label: "간트", icon: GanttChart },
];

export const ViewToggle = ({ view, onViewChange }: ViewToggleProps) => {
  return (
    <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
      {views.map((v) => {
        const Icon = v.icon;
        return (
          <button
            key={v.id}
            onClick={() => onViewChange(v.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors",
              view === v.id
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            <Icon className="w-4 h-4" />
            {v.label}
          </button>
        );
      })}
    </div>
  );
};
