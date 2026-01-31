"use client";

import { useState, useEffect, useRef } from "react";
import { useDocument, useUpdateDocument } from "@/features/document-management";
import { documentStore } from "@/widgets/document-sidebar";
import { cn } from "@/shared/lib/utils";

interface DocumentEditorProps {
  documentId: number;
}

export const DocumentEditor = ({ documentId }: DocumentEditorProps) => {
  const { data: document, isLoading, error } = useDocument(documentId);
  const updateDocument = useUpdateDocument();

  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const originalRef = useRef<{ content: string; title: string } | null>(null);

  // 문서 로드 시 초기화
  useEffect(() => {
    if (document && !isInitialized) {
      setContent(document.content || "");
      setTitle(document.title || "");
      originalRef.current = {
        content: document.content || "",
        title: document.title || "",
      };
      setIsInitialized(true);
    }
  }, [document, isInitialized]);

  // documentId 변경 시 리셋
  useEffect(() => {
    setIsInitialized(false);
    originalRef.current = null;
  }, [documentId]);

  // 자동 저장 (debounce)
  useEffect(() => {
    if (!isInitialized || !originalRef.current) return;

    const hasChanges =
      content !== originalRef.current.content ||
      title !== originalRef.current.title;

    // store 직접 접근 (무한 루프 방지)
    documentStore.state.setTabDirty(documentId, hasChanges);

    if (!hasChanges) return;

    const timer = setTimeout(async () => {
      try {
        await updateDocument.mutateAsync({
          id: documentId,
          data: { content, title },
        });
        originalRef.current = { content, title };
        documentStore.state.setTabDirty(documentId, false);
        documentStore.state.updateTabTitle(documentId, title);
      } catch (err) {
        console.error("Failed to save document:", err);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [content, title, documentId, isInitialized, updateDocument]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-400">
        로딩 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        문서를 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 제목 입력 */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={cn(
          "px-6 py-4 text-2xl font-bold border-b border-zinc-200 dark:border-zinc-700",
          "bg-transparent outline-none",
          "placeholder:text-zinc-400",
        )}
        placeholder="제목 없음"
      />

      {/* 마크다운 에디터 (1차: textarea) */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className={cn(
          "flex-1 p-6 resize-none outline-none",
          "bg-white dark:bg-zinc-950",
          "font-mono text-sm leading-relaxed",
          "placeholder:text-zinc-400",
        )}
        placeholder="내용을 입력하세요... (마크다운 지원 예정)"
      />

      {/* 저장 상태 표시 */}
      <div className="px-6 py-2 text-xs text-zinc-400 border-t border-zinc-200 dark:border-zinc-700">
        {updateDocument.isPending ? (
          "저장 중..."
        ) : (
          <span>
            마지막 저장:{" "}
            {document?.updatedAt
              ? new Date(document.updatedAt).toLocaleString()
              : "-"}
          </span>
        )}
      </div>
    </div>
  );
};
