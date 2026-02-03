"use client";

import { Table, Kanban, GanttChart } from "lucide-react";
import { Button } from "@/shared/ui/button";

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
    <div className="flex items-center gap-1">
      {views.map((v) => {
        const Icon = v.icon;
        return (
          <Button
            key={v.id}
            onClick={() => onViewChange(v.id)}
            variant={view === v.id ? "default" : "outline"}
            size="sm"
          >
            <Icon className="w-4 h-4" />
            <span className="ml-1">{v.label}</span>
          </Button>
        );
      })}
    </div>
  );
};
