"use client";

import { useState } from "react";
import { FolderPlus, PanelLeftClose, PanelLeft, FileText } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  useFoldersWithDocuments,
  useCreateFolder,
  useUpdateFolder,
  useDeleteFolder,
  useCreateDocument,
  useUpdateDocument,
  useDeleteDocument,
  DocumentFolder,
  DocumentInfo,
} from "@/features/document-management";
import { useDocumentStore } from "../model/useDocumentStore";
import { DocumentFolderItem } from "./DocumentFolderItem";
import { DocumentItem } from "./DocumentItem";
import { Button } from "@/shared/ui/button";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { Input } from "@/shared/ui/input";

export const DocumentSidebar = () => {
  const isOpen = useDocumentStore((s) => s.isOpen);
  const toggle = useDocumentStore((s) => s.toggle);
  const openTab = useDocumentStore((s) => s.openTab);

  const { data, isLoading } = useFoldersWithDocuments();
  const createFolder = useCreateFolder();
  const updateFolder = useUpdateFolder();
  const deleteFolder = useDeleteFolder();
  const createDocument = useCreateDocument();
  const updateDocument = useUpdateDocument();
  const deleteDocument = useDeleteDocument();

  // 다이얼로그 상태
  const [folderDialog, setFolderDialog] = useState<{
    open: boolean;
    mode: "create" | "rename";
    folder?: DocumentFolder;
  }>({ open: false, mode: "create" });
  const [folderName, setFolderName] = useState("");

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

  const handleOpenRenameFolder = (folder: DocumentFolder) => {
    setFolderName(folder.name);
    setFolderDialog({ open: true, mode: "rename", folder });
  };

  const handleFolderSubmit = async () => {
    if (!folderName.trim()) return;

    if (folderDialog.mode === "create") {
      await createFolder.mutateAsync({ name: folderName.trim() });
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

  // 문서 다이얼로그 핸들러
  const handleOpenCreateDocument = (folderId?: number) => {
    setDocumentTitle("");
    setDocumentDialog({ open: true, mode: "create", folderId });
  };

  const handleOpenRenameDocument = (doc: DocumentInfo) => {
    setDocumentTitle(doc.title);
    setDocumentDialog({ open: true, mode: "rename", document: doc });
  };

  const handleDocumentSubmit = async () => {
    if (!documentTitle.trim()) return;

    if (documentDialog.mode === "create") {
      const newDoc = await createDocument.mutateAsync({
        title: documentTitle.trim(),
        folderId: documentDialog.folderId,
      });
      openTab({ id: newDoc.id, title: newDoc.title });
    } else if (documentDialog.document) {
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
            {/* 폴더 목록 */}
            {data?.folders.map((folder) => (
              <DocumentFolderItem
                key={folder.id}
                folder={folder}
                onCreateDocument={handleOpenCreateDocument}
                onRenameFolder={handleOpenRenameFolder}
                onDeleteFolder={handleDeleteFolder}
                onRenameDocument={handleOpenRenameDocument}
                onDeleteDocument={handleDeleteDocument}
              />
            ))}

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
                    onClick={() => handleOpenCreateDocument()}
                  >
                    새 문서 만들기
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
        title={folderDialog.mode === "create" ? "새 폴더" : "폴더 이름 변경"}
        submitLabel={folderDialog.mode === "create" ? "생성" : "저장"}
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
      </FormDialog>

      {/* 문서 다이얼로그 */}
      <FormDialog
        open={documentDialog.open}
        onOpenChange={(open) => setDocumentDialog({ ...documentDialog, open })}
        title={documentDialog.mode === "create" ? "새 문서" : "문서 이름 변경"}
        submitLabel={documentDialog.mode === "create" ? "생성" : "저장"}
        onSubmit={handleDocumentSubmit}
        isLoading={createDocument.isPending || updateDocument.isPending}
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
