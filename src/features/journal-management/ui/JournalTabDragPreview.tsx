"use client";

import { FileText } from "lucide-react";
import { JournalTab } from "../model/useJournalTabStore";

interface JournalTabDragPreviewProps {
  tab: JournalTab;
}

export const JournalTabDragPreview = ({ tab }: JournalTabDragPreviewProps) => {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-lg pointer-events-none"
      style={{ width: "fit-content" }}
    >
      <FileText className="h-4 w-4 shrink-0" />
      <span className="text-sm font-medium truncate max-w-[120px]">
        {tab.title}
      </span>
    </div>
  );
};
