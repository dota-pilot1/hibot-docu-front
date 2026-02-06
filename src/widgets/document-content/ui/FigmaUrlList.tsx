"use client";

import { useState } from "react";
import { Plus, ExternalLink, Trash2, Eye, Loader2 } from "lucide-react";
import {
  useFoldersWithDocuments,
  useCreateFigmaDocument,
  useDeleteDocument,
  DocumentInfo,
} from "@/features/document-management";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { BaseDialog } from "@/shared/ui/dialogs/BaseDialog";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { cn } from "@/shared/lib/utils";

interface FigmaUrlListProps {
  folderId: number;
}

const FigmaIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 38 57" fill="currentColor">
    <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" />
    <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" />
    <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" />
    <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" />
    <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" />
  </svg>
);

const FigmaCard = ({
  doc,
  onView,
  onDelete,
}: {
  doc: DocumentInfo;
  onView: () => void;
  onDelete: () => void;
}) => {
  const figmaUrl = doc.content || "";
  const displayUrl = figmaUrl.replace(/^https?:\/\//, "").slice(0, 40);

  return (
    <div
      className={cn(
        "group relative border border-zinc-200 dark:border-zinc-700 rounded-lg",
        "hover:border-purple-300 dark:hover:border-purple-600 transition-colors",
        "overflow-hidden cursor-pointer",
      )}
      onClick={onView}
    >
      {/* 미리보기 영역 */}
      <div className="h-28 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 flex items-center justify-center">
        <FigmaIcon className="h-10 w-10 text-purple-400" />
      </div>

      {/* 정보 */}
      <div className="p-3">
        <p className="text-sm font-medium truncate">{doc.title}</p>
        <p className="text-xs text-zinc-400 truncate mt-1">
          {displayUrl || "URL 없음"}
        </p>
      </div>

      {/* Hover 액션 */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="p-1.5 bg-white dark:bg-zinc-800 rounded-md shadow-sm border border-zinc-200 dark:border-zinc-700 hover:bg-purple-50 dark:hover:bg-purple-900/30"
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          title="미리보기"
        >
          <Eye className="h-3.5 w-3.5 text-purple-600" />
        </button>
        <a
          href={figmaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 bg-white dark:bg-zinc-800 rounded-md shadow-sm border border-zinc-200 dark:border-zinc-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
          onClick={(e) => e.stopPropagation()}
          title="피그마에서 열기"
        >
          <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
        </a>
        <button
          className="p-1.5 bg-white dark:bg-zinc-800 rounded-md shadow-sm border border-zinc-200 dark:border-zinc-700 hover:bg-red-50 dark:hover:bg-red-900/30"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="삭제"
        >
          <Trash2 className="h-3.5 w-3.5 text-red-500" />
        </button>
      </div>
    </div>
  );
};

export const FigmaUrlList = ({ folderId }: FigmaUrlListProps) => {
  const { data } = useFoldersWithDocuments();
  const createFigma = useCreateFigmaDocument();
  const deleteDocument = useDeleteDocument();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [figmaUrl, setFigmaUrl] = useState("");

  const [previewDoc, setPreviewDoc] = useState<DocumentInfo | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);

  // 현재 폴더의 문서(피그마 URL) 목록
  const folder = findFolder(data?.folders || [], folderId);
  const figmaDocs = folder?.documents || [];

  const handleAdd = async () => {
    if (!title.trim() || !figmaUrl.trim()) return;
    await createFigma.mutateAsync({
      title: title.trim(),
      folderId,
      figmaUrl: figmaUrl.trim(),
    });
    setTitle("");
    setFigmaUrl("");
    setAddDialogOpen(false);
  };

  const handleDelete = async (docId: number) => {
    if (confirm("삭제하시겠습니까?")) {
      await deleteDocument.mutateAsync(docId);
    }
  };

  const getFigmaEmbedUrl = (url: string) => {
    return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
        <div>
          <h2 className="text-lg font-semibold">{folder?.name || "피그마"}</h2>
          <p className="text-sm text-zinc-400">피그마 URL을 관리하세요</p>
        </div>
        <Button
          size="sm"
          onClick={() => setAddDialogOpen(true)}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          피그마 추가
        </Button>
      </div>

      {/* 카드 목록 */}
      <div className="flex-1 overflow-y-auto p-4">
        {figmaDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400">
            <FigmaIcon className="h-12 w-12 mb-3 text-purple-300" />
            <p className="text-sm">등록된 피그마가 없습니다</p>
            <p className="text-xs mt-1">
              상단 버튼으로 피그마 URL을 추가하세요
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {figmaDocs.map((doc) => (
              <FigmaCard
                key={doc.id}
                doc={doc}
                onView={() => {
                  setPreviewDoc(doc);
                  setIframeLoading(true);
                }}
                onDelete={() => handleDelete(doc.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 피그마 추가 다이얼로그 */}
      <FormDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        title="피그마 추가"
        submitLabel="추가"
        onSubmit={handleAdd}
        isLoading={createFigma.isPending}
        maxWidth="sm:max-w-md"
      >
        <div className="space-y-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목 (예: 로그인 화면 디자인)"
            autoFocus
          />
          <Input
            value={figmaUrl}
            onChange={(e) => setFigmaUrl(e.target.value)}
            placeholder="https://www.figma.com/..."
          />
        </div>
      </FormDialog>

      {/* 피그마 미리보기 다이얼로그 */}
      <BaseDialog
        open={!!previewDoc}
        onOpenChange={(open) => {
          if (!open) setPreviewDoc(null);
        }}
        title={previewDoc?.title || "피그마 미리보기"}
        maxWidth="max-w-6xl"
      >
        <div className="relative w-full" style={{ height: "70vh" }}>
          {iframeLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          )}
          {previewDoc?.content && (
            <iframe
              src={getFigmaEmbedUrl(previewDoc.content)}
              className="w-full h-full rounded-lg border border-zinc-200 dark:border-zinc-700"
              allowFullScreen
              onLoad={() => setIframeLoading(false)}
            />
          )}
        </div>
      </BaseDialog>
    </div>
  );
};

// 폴더 트리에서 ID로 폴더 찾기
function findFolder(
  folders: {
    id: number;
    name: string;
    type: string;
    children: any[];
    documents: DocumentInfo[];
  }[],
  id: number,
): { name: string; type: string; documents: DocumentInfo[] } | null {
  for (const folder of folders) {
    if (folder.id === id) return folder;
    const found = findFolder(folder.children, id);
    if (found) return found;
  }
  return null;
}
