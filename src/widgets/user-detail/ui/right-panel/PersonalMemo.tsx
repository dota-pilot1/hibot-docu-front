"use client";

import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";

interface PersonalMemoProps {
  userId: number;
}

export const PersonalMemo = ({ userId }: PersonalMemoProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [memo, setMemo] = useState("이번 주 금요일 휴가 예정");
  const [tempMemo, setTempMemo] = useState(memo);

  const handleSave = () => {
    setMemo(tempMemo);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempMemo(memo);
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">개인 메모</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            <Pencil size={14} />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={tempMemo}
            onChange={(e) => setTempMemo(e.target.value)}
            className="w-full p-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-900 resize-none"
            rows={2}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="p-1 text-zinc-400 hover:text-zinc-600"
            >
              <X size={16} />
            </button>
            <button
              onClick={handleSave}
              className="p-1 text-green-500 hover:text-green-600"
            >
              <Check size={16} />
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {memo || "메모가 없습니다"}
        </p>
      )}
    </div>
  );
};
