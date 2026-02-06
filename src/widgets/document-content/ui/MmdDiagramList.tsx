"use client";

import { useState } from "react";
import { Plus, Trash2, Eye, Pencil, Loader2 } from "lucide-react";
import {
  useFoldersWithDocuments,
  useCreateMmdDocument,
  useUpdateMmdDocument,
  useDeleteDocument,
  DocumentInfo,
} from "@/features/document-management";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { BaseDialog } from "@/shared/ui/dialogs/BaseDialog";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { MermaidRenderer } from "@/shared/ui/MermaidRenderer";
import { cn } from "@/shared/lib/utils";

interface MmdDiagramListProps {
  folderId: number;
}

const MmdIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="18" cy="18" r="3" />
    <circle cx="6" cy="6" r="3" />
    <path d="M13 6h3a2 2 0 0 1 2 2v7" />
    <path d="M6 9v12" />
  </svg>
);

const DEFAULT_MMD = `graph TD
    A[시작] --> B{조건}
    B -->|Yes| C[처리]
    B -->|No| D[종료]
    C --> D`;

const MmdCard = ({
  doc,
  onView,
  onEdit,
  onDelete,
}: {
  doc: DocumentInfo;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const mmdCode = doc.content || "";
  const previewLines = mmdCode.split("\n").slice(0, 3).join("\n");

  return (
    <div
      className={cn(
        "group relative border border-zinc-200 dark:border-zinc-700 rounded-lg",
        "hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors",
        "overflow-hidden cursor-pointer",
      )}
      onClick={onView}
    >
      {/* 미리보기 영역 */}
      <div className="h-28 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 flex items-center justify-center overflow-hidden p-2">
        <div className="transform scale-[0.3] origin-center pointer-events-none">
          <MermaidRenderer content={mmdCode} />
        </div>
      </div>

      {/* 정보 */}
      <div className="p-3">
        <p className="text-sm font-medium truncate">{doc.title}</p>
        <p className="text-xs text-zinc-400 truncate mt-1 font-mono">
          {previewLines || "코드 없음"}
        </p>
      </div>

      {/* Hover 액션 */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="p-1.5 bg-white dark:bg-zinc-800 rounded-md shadow-sm border border-zinc-200 dark:border-zinc-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          title="미리보기"
        >
          <Eye className="h-3.5 w-3.5 text-emerald-600" />
        </button>
        <button
          className="p-1.5 bg-white dark:bg-zinc-800 rounded-md shadow-sm border border-zinc-200 dark:border-zinc-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          title="수정"
        >
          <Pencil className="h-3.5 w-3.5 text-blue-600" />
        </button>
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

export const MmdDiagramList = ({ folderId }: MmdDiagramListProps) => {
  const { data } = useFoldersWithDocuments();
  const createMmd = useCreateMmdDocument();
  const updateMmd = useUpdateMmdDocument();
  const deleteDocument = useDeleteDocument();

  // 추가 다이얼로그
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [mmdCode, setMmdCode] = useState(DEFAULT_MMD);

  // 수정 다이얼로그
  const [editDoc, setEditDoc] = useState<DocumentInfo | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMmdCode, setEditMmdCode] = useState("");

  // 미리보기 다이얼로그
  const [previewDoc, setPreviewDoc] = useState<DocumentInfo | null>(null);

  // 현재 폴더의 문서(MMD) 목록
  const folder = findFolder(data?.folders || [], folderId);
  const mmdDocs = folder?.documents || [];

  const handleAdd = async () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!mmdCode.trim()) return;
    await createMmd.mutateAsync({
      title: title.trim(),
      folderId,
      mmdCode: mmdCode.trim(),
    });
    setTitle("");
    setMmdCode(DEFAULT_MMD);
    setAddDialogOpen(false);
  };

  const handleEdit = async () => {
    if (!editDoc || !editTitle.trim()) return;
    await updateMmd.mutateAsync({
      id: editDoc.id,
      title: editTitle.trim(),
      mmdCode: editMmdCode,
    });
    setEditDoc(null);
  };

  const handleDelete = async (docId: number) => {
    if (confirm("삭제하시겠습니까?")) {
      await deleteDocument.mutateAsync(docId);
    }
  };

  const openEdit = (doc: DocumentInfo) => {
    setEditDoc(doc);
    setEditTitle(doc.title);
    setEditMmdCode(doc.content || "");
  };

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
        <div>
          <h2 className="text-lg font-semibold">
            {folder?.name || "MMD 다이어그램"}
          </h2>
          <p className="text-sm text-zinc-400">
            Mermaid 다이어그램을 관리하세요
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setAddDialogOpen(true)}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          다이어그램 추가
        </Button>
      </div>

      {/* 카드 목록 */}
      <div className="flex-1 overflow-y-auto p-4">
        {mmdDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400">
            <MmdIcon className="h-12 w-12 mb-3 text-emerald-300" />
            <p className="text-sm">등록된 다이어그램이 없습니다</p>
            <p className="text-xs mt-1">
              상단 버튼으로 Mermaid 다이어그램을 추가하세요
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {mmdDocs.map((doc) => (
              <MmdCard
                key={doc.id}
                doc={doc}
                onView={() => setPreviewDoc(doc)}
                onEdit={() => openEdit(doc)}
                onDelete={() => handleDelete(doc.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 다이어그램 추가 다이얼로그 */}
      <FormDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        title="다이어그램 추가"
        submitLabel="추가"
        onSubmit={handleAdd}
        isLoading={createMmd.isPending}
        fullScreen
      >
        <div className="flex flex-col h-full gap-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목 (예: 로그인 플로우)"
            autoFocus
          />
          <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
            <div className="flex flex-col min-h-0">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Mermaid 코드
              </label>
              <Textarea
                value={mmdCode}
                onChange={(e) => setMmdCode(e.target.value)}
                placeholder="graph TD&#10;    A --> B"
                className="font-mono text-sm flex-1 resize-none"
              />
            </div>
            <div className="flex flex-col min-h-0">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                미리보기
              </label>
              <div className="flex-1 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 bg-white dark:bg-zinc-900 overflow-auto">
                {mmdCode.trim() ? (
                  <MermaidRenderer content={mmdCode} />
                ) : (
                  <div className="flex items-center justify-center h-full text-zinc-400 text-sm">
                    코드를 입력하면 미리보기가 표시됩니다
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </FormDialog>

      {/* 다이어그램 수정 다이얼로그 */}
      <FormDialog
        open={!!editDoc}
        onOpenChange={(open) => {
          if (!open) setEditDoc(null);
        }}
        title="다이어그램 수정"
        submitLabel="저장"
        onSubmit={handleEdit}
        isLoading={updateMmd.isPending}
        fullScreen
      >
        <div className="flex flex-col h-full gap-3">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="제목"
            autoFocus
          />
          <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
            <div className="flex flex-col min-h-0">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Mermaid 코드
              </label>
              <Textarea
                value={editMmdCode}
                onChange={(e) => setEditMmdCode(e.target.value)}
                placeholder="graph TD&#10;    A --> B"
                className="font-mono text-sm flex-1 resize-none"
              />
            </div>
            <div className="flex flex-col min-h-0">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                미리보기
              </label>
              <div className="flex-1 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 bg-white dark:bg-zinc-900 overflow-auto">
                {editMmdCode.trim() ? (
                  <MermaidRenderer content={editMmdCode} />
                ) : (
                  <div className="flex items-center justify-center h-full text-zinc-400 text-sm">
                    코드를 입력하면 미리보기가 표시됩니다
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </FormDialog>

      {/* 다이어그램 미리보기 다이얼로그 */}
      <BaseDialog
        open={!!previewDoc}
        onOpenChange={(open) => {
          if (!open) setPreviewDoc(null);
        }}
        title={previewDoc?.title || "다이어그램 미리보기"}
        maxWidth="max-w-6xl"
      >
        <div className="w-full overflow-auto p-4" style={{ minHeight: "40vh" }}>
          {previewDoc?.content && (
            <MermaidRenderer content={previewDoc.content} />
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
