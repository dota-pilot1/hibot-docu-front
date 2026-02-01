"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Check, X } from "lucide-react";
import { taskApi } from "@/entities/task";

interface PersonalMemoProps {
  userId: number;
}

export const PersonalMemo = ({ userId }: PersonalMemoProps) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [tempMemo, setTempMemo] = useState("");

  const { data: memoData } = useQuery({
    queryKey: ["memo", userId],
    queryFn: () => taskApi.getUserMemo(userId),
  });

  const updateMemoMutation = useMutation({
    mutationFn: (memo: string) => taskApi.updateUserMemo(userId, memo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memo", userId] });
      setIsEditing(false);
    },
  });

  useEffect(() => {
    if (memoData?.memo) {
      setTempMemo(memoData.memo);
    }
  }, [memoData]);

  const handleEdit = () => {
    setTempMemo(memoData?.memo || "");
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMemoMutation.mutate(tempMemo);
  };

  const handleCancel = () => {
    setTempMemo(memoData?.memo || "");
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">개인 메모</h3>
        {!isEditing && (
          <button
            onClick={handleEdit}
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
              disabled={updateMemoMutation.isPending}
            >
              <X size={16} />
            </button>
            <button
              onClick={handleSave}
              className="p-1 text-green-500 hover:text-green-600"
              disabled={updateMemoMutation.isPending}
            >
              <Check size={16} />
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {memoData?.memo || "메모가 없습니다"}
        </p>
      )}
    </div>
  );
};
