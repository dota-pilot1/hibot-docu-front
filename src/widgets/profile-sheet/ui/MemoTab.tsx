"use client";

import { useState, useEffect, useCallback } from "react";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUserStore } from "@/entities/user/model/store";

// 임시로 localStorage 사용 (추후 백엔드 API 연동)
const MEMO_STORAGE_KEY = "user-memo";

export const MemoTab = () => {
  const user = useUserStore((s) => s.user);
  const [memo, setMemo] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 메모 불러오기
  useEffect(() => {
    if (user) {
      const storageKey = `${MEMO_STORAGE_KEY}-${user.userId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setMemo(saved);
      }
      setIsLoaded(true);
    }
  }, [user]);

  // 메모 저장
  const handleSave = useCallback(async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      // TODO: 백엔드 API 연동
      // await api.patch('/user-memos', { memo });

      // 임시로 localStorage에 저장
      const storageKey = `${MEMO_STORAGE_KEY}-${user.userId}`;
      localStorage.setItem(storageKey, memo);

      toast.success("메모가 저장되었습니다");
    } catch {
      toast.error("메모 저장에 실패했습니다");
    } finally {
      setIsSaving(false);
    }
  }, [memo, user]);

  // Ctrl+S로 저장
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">
          개인 메모 (Ctrl+S로 저장)
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={handleSave}
          disabled={isSaving}
          className="gap-1.5"
        >
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          저장
        </Button>
      </div>

      <Textarea
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="메모를 입력하세요..."
        className="flex-1 resize-none min-h-[300px]"
      />
    </div>
  );
};
