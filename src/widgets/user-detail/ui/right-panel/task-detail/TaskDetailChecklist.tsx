"use client";

import { useState } from "react";
import { useUpdateTaskDetail } from "@/entities/task/hooks/useTaskDetail";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { ChecklistItem } from "@/entities/task/model/types";
import { Trash2, Plus } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface TaskDetailChecklistProps {
  taskId: number;
  checklist: ChecklistItem[];
}

export function TaskDetailChecklist({
  taskId,
  checklist,
}: TaskDetailChecklistProps) {
  const { mutate: updateDetail } = useUpdateTaskDetail(taskId);
  const [newItemText, setNewItemText] = useState("");

  const completedCount = checklist.filter((item) => item.completed).length;
  const totalCount = checklist.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleAddItem = () => {
    if (!newItemText.trim()) return;

    const newChecklist = [
      ...checklist,
      {
        id: Date.now(),
        text: newItemText,
        completed: false,
      },
    ];

    updateDetail({ checklist: newChecklist });
    setNewItemText("");
  };

  const handleToggle = (itemId: number) => {
    const newChecklist = checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    updateDetail({ checklist: newChecklist });
  };

  const handleDelete = (itemId: number) => {
    const newChecklist = checklist.filter((item) => item.id !== itemId);
    updateDetail({ checklist: newChecklist });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">
          ✅ 체크리스트 ({completedCount}/{totalCount} 완료)
        </h4>
        <div className="text-xs text-gray-600 font-medium">
          {progress.toFixed(0)}%
        </div>
      </div>

      {/* 진행률 바 */}
      {totalCount > 0 && (
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* 체크리스트 항목 */}
      {checklist.length > 0 && (
        <div className="space-y-2">
          {checklist.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 group py-1 hover:bg-gray-50 rounded px-2 -mx-2 transition-colors"
            >
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => handleToggle(item.id)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span
                className={cn(
                  "flex-1 text-sm",
                  item.completed && "line-through text-gray-400"
                )}
              >
                {item.text}
              </span>
              <button
                onClick={() => handleDelete(item.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 새 항목 추가 */}
      <div className="flex gap-2 pt-2">
        <Input
          placeholder="새 항목 추가..."
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
          className="h-9 text-sm"
        />
        <Button size="sm" onClick={handleAddItem} disabled={!newItemText.trim()}>
          <Plus className="h-4 w-4 mr-1" />
          추가
        </Button>
      </div>

      {checklist.length === 0 && (
        <p className="text-sm text-gray-400 italic text-center py-4">
          체크리스트 항목이 없습니다. 항목을 추가해보세요.
        </p>
      )}
    </div>
  );
}
