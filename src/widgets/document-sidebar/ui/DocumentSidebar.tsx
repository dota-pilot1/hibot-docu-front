"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  FolderPlus,
  PanelLeftClose,
  PanelLeft,
  FileText,
  Folder,
  Upload,
} from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/shared/lib/utils";
import {
  useFoldersWithDocuments,
  useCreateFolder,
  useUpdateFolder,
  useDeleteFolder,
  useReorderFolders,
  useCreateDocument,
  useUpdateDocument,
  useDeleteDocument,
  useUploadDocument,
  useUploadMultipleDocuments,
  useMoveDocument,
  DocumentFolder,
  DocumentInfo,
} from "@/features/document-management";
import { useDocumentStore } from "../model/useDocumentStore";
import { DocumentFolderItem } from "./DocumentFolderItem";
import { DocumentItem } from "./DocumentItem";
import { Button } from "@/shared/ui/button";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { Input } from "@/shared/ui/input";

// 트리에서 폴더 찾기
const findFolderInTree = (
  folders: DocumentFolder[],
  id: number,
): DocumentFolder | null => {
  for (const folder of folders) {
    if (folder.id === id) return folder;
    if (folder.children?.length) {
      const found = findFolderInTree(folder.children, id);
      if (found) return found;
    }
  }
  return null;
};

// 하위 폴더 reorder
const reorderChildFolders = (
  folders: DocumentFolder[],
  parentId: number,
  activeId: number,
  overId: number,
): DocumentFolder[] => {
  return folders.map((folder) => {
    if (folder.id === parentId) {
      const oldIndex = folder.children.findIndex((c) => c.id === activeId);
      const newIndex = folder.children.findIndex((c) => c.id === overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        return {
          ...folder,
          children: arrayMove(folder.children, oldIndex, newIndex),
        };
      }
      return folder;
    }
    if (folder.children?.length) {
      return {
        ...folder,
        children: reorderChildFolders(
          folder.children,
          parentId,
          activeId,
          overId,
        ),
      };
    }
    return folder;
  });
};

export const DocumentSidebar = () => {
  const isOpen = useDocumentStore((s) => s.isOpen);
  const toggle = useDocumentStore((s) => s.toggle);
  const openTab = useDocumentStore((s) => s.openTab);

  const { data, isLoading } = useFoldersWithDocuments();
  const createFolder = useCreateFolder();
  const updateFolder = useUpdateFolder();
  const deleteFolder = useDeleteFolder();
  const reorderFolders = useReorderFolders();
  const createDocument = useCreateDocument();
  const updateDocument = useUpdateDocument();
  const deleteDocument = useDeleteDocument();
  const uploadDocument = useUploadDocument();
  const uploadMultiple = useUploadMultipleDocuments();
  const moveDocument = useMoveDocument();

  // DnD 관련
  const [localFolders, setLocalFolders] = useState<DocumentFolder[]>([]);
  const [activeFolder, setActiveFolder] = useState<DocumentFolder | null>(null);
  const [activeDocument, setActiveDocument] = useState<DocumentInfo | null>(
    null,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  // 서버 데이터가 변경되면 localFolders 동기화
  useEffect(() => {
    if (data?.folders) {
      setLocalFolders(data.folders);
    }
  }, [data?.folders]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const activeId = String(event.active.id);

    if (activeId.startsWith("doc-")) {
      // 파일 드래그
      const doc = event.active.data.current?.document as
        | DocumentInfo
        | undefined;
      if (doc) setActiveDocument(doc);
    } else {
      // 폴더 드래그 - 최상위 또는 하위 폴더
      const id = event.active.id as number;
      setLocalFolders((prev) => {
        const folder = findFolderInTree(prev, id);
        if (folder) setActiveFolder(folder);
        return prev;
      });
    }
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // 파일 드래그 중에는 폴더 reorder 안 함
    if (String(active.id).startsWith("doc-")) return;

    // sortable-folder끼리만 reorder (droppable 무시)
    if (active.data.current?.type !== "sortable-folder") return;
    if (over.data.current?.type !== "sortable-folder") return;

    // 같은 부모의 폴더끼리만 reorder
    const activeParentId = active.data.current?.parentId ?? null;
    const overParentId = over.data.current?.parentId ?? null;
    if (activeParentId !== overParentId) return;

    setLocalFolders((prev) => {
      if (activeParentId === null) {
        // 최상위 폴더 reorder
        const oldIndex = prev.findIndex((f) => f.id === active.id);
        const newIndex = prev.findIndex((f) => f.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          return arrayMove(prev, oldIndex, newIndex);
        }
      } else {
        // 하위 폴더 reorder
        return reorderChildFolders(
          prev,
          activeParentId,
          active.id as number,
          over.id as number,
        );
      }
      return prev;
    });
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      const activeId = String(active.id);

      if (activeId.startsWith("doc-")) {
        // 파일 → 폴더 드롭
        setActiveDocument(null);
        if (over) {
          const overId = String(over.id);
          if (overId.startsWith("folder-drop-")) {
            const folderId = over.data.current?.folderId as number;
            const docId = active.data.current?.document?.id as number;
            if (docId && folderId) {
              await moveDocument.mutateAsync({ id: docId, folderId });
            }
          }
        }
      } else if (active.data.current?.type === "sortable-folder") {
        // 폴더 reorder
        setActiveFolder(null);
        const activeParentId = active.data.current?.parentId ?? null;

        setLocalFolders((prev) => {
          if (activeParentId === null) {
            // 최상위 폴더 reorder
            const folderIds = prev.map((f) => f.id);
            reorderFolders.mutateAsync(folderIds);
          } else {
            // 하위 폴더 reorder - 부모 폴더의 children에서 ID 추출
            const parent = findFolderInTree(prev, activeParentId);
            if (parent) {
              const childIds = parent.children.map((c) => c.id);
              reorderFolders.mutateAsync(childIds);
            }
          }
          return prev;
        });
      }
    },
    [reorderFolders, moveDocument],
  );

  const handleDragCancel = useCallback(() => {
    setActiveFolder(null);
    setActiveDocument(null);
  }, []);

  // 파일 input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetFolderId, setUploadTargetFolderId] = useState<
    number | null
  >(null);

  // 다이얼로그 상태
  const [folderDialog, setFolderDialog] = useState<{
    open: boolean;
    mode: "create" | "rename" | "subfolder";
    folder?: DocumentFolder;
    parentId?: number;
  }>({ open: false, mode: "create" });
  const [folderName, setFolderName] = useState("");
  const [folderType, setFolderType] = useState<"general" | "figma">("general");

  const [documentDialog, setDocumentDialog] = useState<{
    open: boolean;
    mode: "create" | "rename";
    folderId?: number;
    document?: DocumentInfo;
  }>({ open: false, mode: "create" });
  const [documentTitle, setDocumentTitle] = useState("");

  // 폴더 다이얼로그 핸들러
  const handleOpenCreateFolder = () => {
    setFolderName("");
    setFolderDialog({ open: true, mode: "create" });
  };

  const handleOpenCreateSubFolder = (parentId: number) => {
    setFolderName("");
    setFolderType("general");
    setFolderDialog({ open: true, mode: "subfolder", parentId });
  };

  const handleOpenRenameFolder = (folder: DocumentFolder) => {
    setFolderName(folder.name);
    setFolderDialog({ open: true, mode: "rename", folder });
  };

  const handleFolderSubmit = async () => {
    if (!folderName.trim()) return;

    if (folderDialog.mode === "create") {
      await createFolder.mutateAsync({ name: folderName.trim() });
    } else if (folderDialog.mode === "subfolder" && folderDialog.parentId) {
      await createFolder.mutateAsync({
        name: folderName.trim(),
        parentId: folderDialog.parentId,
        type: folderType,
      });
    } else if (folderDialog.folder) {
      await updateFolder.mutateAsync({
        id: folderDialog.folder.id,
        data: { name: folderName.trim() },
      });
    }
    setFolderDialog({ open: false, mode: "create" });
  };

  const handleDeleteFolder = async (folderId: number) => {
    if (
      confirm("폴더를 삭제하시겠습니까? 폴더 내 문서는 미분류로 이동됩니다.")
    ) {
      await deleteFolder.mutateAsync(folderId);
    }
  };

  // 파일 업로드 핸들러
  const handleUploadToFolder = (folderId: number) => {
    setUploadTargetFolderId(folderId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length === 1) {
      const doc = await uploadDocument.mutateAsync({
        file: files[0],
        folderId: uploadTargetFolderId,
      });
      openTab({ id: doc.id, title: doc.title });
    } else {
      await uploadMultiple.mutateAsync({
        files: Array.from(files),
        folderId: uploadTargetFolderId,
      });
    }

    // input 초기화
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploadTargetFolderId(null);
  };

  // 문서 다이얼로그 핸들러
  const handleOpenRenameDocument = (doc: DocumentInfo) => {
    setDocumentTitle(doc.title);
    setDocumentDialog({ open: true, mode: "rename", document: doc });
  };

  const handleDocumentSubmit = async () => {
    if (!documentTitle.trim()) return;

    if (documentDialog.document) {
      await updateDocument.mutateAsync({
        id: documentDialog.document.id,
        data: { title: documentTitle.trim() },
      });
    }
    setDocumentDialog({ open: false, mode: "create" });
  };

  const handleDeleteDocument = async (docId: number) => {
    if (confirm("문서를 삭제하시겠습니까?")) {
      await deleteDocument.mutateAsync(docId);
    }
  };

  // 축소 상태
  if (!isOpen) {
    return (
      <div className="h-full flex flex-col items-center py-4 bg-white dark:bg-zinc-900">
        <Button variant="ghost" size="icon" onClick={toggle}>
          <PanelLeft className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900">
      {/* 숨겨진 파일 input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
        accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.txt,.csv,.hwp,.jpg,.jpeg,.png,.gif,.webp,.svg,.zip,.rar,.7z"
      />

      {/* 헤더 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200 dark:border-zinc-700">
        <span className="font-medium text-sm">문서</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleOpenCreateFolder}
            title="새 폴더"
          >
            <FolderPlus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={toggle}
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 폴더/문서 목록 */}
      <div className="flex-1 overflow-y-auto py-2">
        {isLoading ? (
          <div className="px-3 py-2 text-sm text-zinc-400">로딩 중...</div>
        ) : (
          <>
            {/* 폴더 목록 (DnD) */}
            <DndContext
              sensors={sensors}
              collisionDetection={
                activeDocument ? pointerWithin : closestCenter
              }
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <SortableContext
                items={localFolders.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                {localFolders.map((folder) => (
                  <DocumentFolderItem
                    key={folder.id}
                    folder={folder}
                    depth={0}
                    onUploadToFolder={handleUploadToFolder}
                    onCreateSubFolder={handleOpenCreateSubFolder}
                    onRenameFolder={handleOpenRenameFolder}
                    onDeleteFolder={handleDeleteFolder}
                    onRenameDocument={handleOpenRenameDocument}
                    onDeleteDocument={handleDeleteDocument}
                  />
                ))}
              </SortableContext>

              <DragOverlay>
                {activeFolder && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 rounded-md shadow-lg border border-zinc-200 dark:border-zinc-700">
                    <Folder className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">
                      {activeFolder.name}
                    </span>
                  </div>
                )}
                {activeDocument && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 rounded-md shadow-lg border border-blue-300 dark:border-blue-600">
                    <FileText className="h-4 w-4 text-zinc-400" />
                    <span className="text-sm font-medium">
                      {activeDocument.originalName || activeDocument.title}
                    </span>
                  </div>
                )}
              </DragOverlay>
            </DndContext>

            {/* 미분류 문서 */}
            {data?.unassignedDocuments &&
              data.unassignedDocuments.length > 0 && (
                <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                  <div className="px-3 py-1 text-xs text-zinc-400 font-medium">
                    미분류
                  </div>
                  {data.unassignedDocuments.map((doc) => (
                    <DocumentItem
                      key={doc.id}
                      document={doc}
                      onRename={handleOpenRenameDocument}
                      onDelete={handleDeleteDocument}
                    />
                  ))}
                </div>
              )}

            {/* 빈 상태 */}
            {data?.folders.length === 0 &&
              data?.unassignedDocuments.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
                  <FileText className="h-10 w-10 mb-2" />
                  <p className="text-sm">문서가 없습니다</p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleOpenCreateFolder}
                  >
                    폴더 만들기
                  </Button>
                </div>
              )}
          </>
        )}
      </div>

      {/* 폴더 다이얼로그 */}
      <FormDialog
        open={folderDialog.open}
        onOpenChange={(open) => setFolderDialog({ ...folderDialog, open })}
        title={
          folderDialog.mode === "subfolder"
            ? "새 하위 폴더"
            : folderDialog.mode === "create"
              ? "새 폴더"
              : "폴더 이름 변경"
        }
        submitLabel={folderDialog.mode === "rename" ? "저장" : "생성"}
        onSubmit={handleFolderSubmit}
        isLoading={createFolder.isPending || updateFolder.isPending}
        maxWidth="sm:max-w-sm"
      >
        <Input
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder="폴더 이름"
          autoFocus
        />
        {folderDialog.mode === "subfolder" && (
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors",
                folderType === "general"
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800",
              )}
              onClick={() => setFolderType("general")}
            >
              <Folder className="h-4 w-4" />
              일반
            </button>
            <button
              type="button"
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors",
                folderType === "figma"
                  ? "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                  : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800",
              )}
              onClick={() => setFolderType("figma")}
            >
              <svg className="h-4 w-4" viewBox="0 0 38 57" fill="currentColor">
                <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" />
                <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" />
                <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" />
                <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" />
                <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" />
              </svg>
              피그마
            </button>
          </div>
        )}
      </FormDialog>

      {/* 문서 이름 변경 다이얼로그 */}
      <FormDialog
        open={documentDialog.open}
        onOpenChange={(open) => setDocumentDialog({ ...documentDialog, open })}
        title="문서 이름 변경"
        submitLabel="저장"
        onSubmit={handleDocumentSubmit}
        isLoading={updateDocument.isPending}
        maxWidth="sm:max-w-sm"
      >
        <Input
          value={documentTitle}
          onChange={(e) => setDocumentTitle(e.target.value)}
          placeholder="문서 제목"
          autoFocus
        />
      </FormDialog>
    </div>
  );
};
