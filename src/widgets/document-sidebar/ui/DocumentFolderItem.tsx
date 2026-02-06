"use client";

import {
  ChevronRight,
  Folder,
  FolderOpen,
  FolderPlus,
  GripVertical,
  MoreHorizontal,
  Upload,
  Pencil,
  Trash2,
} from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/shared/lib/utils";
import { DocumentFolder, DocumentInfo } from "@/features/document-management";
import { useDocumentStore } from "../model/useDocumentStore";
import { DocumentItem } from "./DocumentItem";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

interface DocumentFolderItemProps {
  folder: DocumentFolder;
  depth?: number;
  onUploadToFolder: (folderId: number) => void;
  onCreateSubFolder: (parentId: number) => void;
  onRenameFolder: (folder: DocumentFolder) => void;
  onDeleteFolder: (folderId: number) => void;
  onRenameDocument: (doc: DocumentInfo) => void;
  onDeleteDocument: (docId: number) => void;
}

export const DocumentFolderItem = ({
  folder,
  depth = 0,
  onUploadToFolder,
  onCreateSubFolder,
  onRenameFolder,
  onDeleteFolder,
  onRenameDocument,
  onDeleteDocument,
}: DocumentFolderItemProps) => {
  const expandedFolders = useDocumentStore((s) => s.expandedFolders);
  const toggleFolder = useDocumentStore((s) => s.toggleFolder);
  const openFolderTab = useDocumentStore((s) => s.openFolderTab);

  const isExpanded = expandedFolders.has(folder.id);
  const totalCount =
    folder.documents.length +
    folder.children.reduce((sum, c) => sum + c.documents.length, 0);

  // 최상위 폴더만 sortable 적용
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: folder.id,
    data: { type: "sortable-folder", parentId: folder.parentId },
  });

  // 파일 드롭 대상
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `folder-drop-${folder.id}`,
    data: { type: "folder", folderId: folder.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFolder(folder.id);
  };

  const handleOpenTab = () => {
    openFolderTab({
      id: folder.id,
      title: folder.name,
      folderType: folder.type,
    });
  };

  return (
    <div ref={setNodeRef} style={style}>
      {/* 폴더 헤더 */}
      <div
        ref={setDropRef}
        className={cn(
          "flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer",
          "hover:bg-zinc-100 dark:hover:bg-zinc-800",
          "group",
          isDragging && "opacity-40",
          isOver && "bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-400",
        )}
        style={{ paddingLeft: `${depth === 0 ? 4 : 8 + depth * 16}px` }}
        onClick={handleOpenTab}
      >
        {/* 드래그 핸들 */}
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "cursor-grab active:cursor-grabbing p-0.5 rounded shrink-0",
            "hover:bg-zinc-200 dark:hover:bg-zinc-700",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 text-zinc-400" />
        </div>

        {/* 화살표 클릭 → 펼치기/접기 */}
        <button
          className="p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 shrink-0"
          onClick={handleToggle}
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 text-zinc-400 transition-transform",
              isExpanded && "rotate-90",
            )}
          />
        </button>
        {folder.type === "figma" ? (
          <svg
            className="h-4 w-4 shrink-0 text-purple-500"
            viewBox="0 0 38 57"
            fill="currentColor"
          >
            <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" />
            <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" />
            <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" />
            <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" />
            <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" />
          </svg>
        ) : isExpanded ? (
          <FolderOpen
            className={cn(
              "h-4 w-4 shrink-0",
              depth === 0 ? "text-yellow-500" : "text-blue-400",
            )}
          />
        ) : (
          <Folder
            className={cn(
              "h-4 w-4 shrink-0",
              depth === 0 ? "text-yellow-500" : "text-blue-400",
            )}
          />
        )}
        <span
          className={cn(
            "flex-1 text-sm truncate",
            depth > 0 && "text-zinc-600 dark:text-zinc-400",
          )}
        >
          {folder.name}
        </span>
        <span className="text-xs text-zinc-400">{totalCount}</span>

        {/* 컨텍스트 메뉴 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "p-1 rounded opacity-0 group-hover:opacity-100",
                "hover:bg-zinc-200 dark:hover:bg-zinc-700",
                "transition-opacity",
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4 text-zinc-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {folder.type !== "figma" && (
              <DropdownMenuItem onClick={() => onUploadToFolder(folder.id)}>
                <Upload className="h-4 w-4 mr-2" />
                파일 업로드
              </DropdownMenuItem>
            )}
            {depth === 0 && (
              <DropdownMenuItem onClick={() => onCreateSubFolder(folder.id)}>
                <FolderPlus className="h-4 w-4 mr-2" />새 하위 폴더
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onRenameFolder(folder)}>
              <Pencil className="h-4 w-4 mr-2" />
              이름 변경
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeleteFolder(folder.id)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 하위 폴더 + 문서 목록 */}
      {isExpanded && (
        <div className="ml-4 pl-2 border-l-2 border-zinc-200 dark:border-zinc-700">
          {/* 하위 폴더 */}
          <SortableContext
            items={folder.children.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {folder.children.map((child) => (
              <DocumentFolderItem
                key={child.id}
                folder={child}
                depth={depth + 1}
                onUploadToFolder={onUploadToFolder}
                onCreateSubFolder={onCreateSubFolder}
                onRenameFolder={onRenameFolder}
                onDeleteFolder={onDeleteFolder}
                onRenameDocument={onRenameDocument}
                onDeleteDocument={onDeleteDocument}
              />
            ))}
          </SortableContext>

          {/* 문서 목록 */}
          {folder.documents.map((doc) => (
            <DocumentItem
              key={doc.id}
              document={doc}
              onRename={onRenameDocument}
              onDelete={onDeleteDocument}
            />
          ))}

          {folder.children.length === 0 && folder.documents.length === 0 && (
            <div className="px-4 py-2 text-xs text-zinc-400">비어 있음</div>
          )}
        </div>
      )}
    </div>
  );
};
