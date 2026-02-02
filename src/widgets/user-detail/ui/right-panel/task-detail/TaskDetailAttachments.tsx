"use client";

import { useState, useCallback } from "react";
import {
  useUploadTaskAttachment,
  useDeleteTaskAttachment,
} from "@/entities/task/hooks/useTaskDetail";
import { Button } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { TaskDetailAttachment } from "@/entities/task/model/types";
import { Trash2, Upload, FileText, Download, CloudUpload } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface TaskDetailAttachmentsProps {
  taskId: number;
  attachments: TaskDetailAttachment[];
  canEdit: boolean;
}

export function TaskDetailAttachments({
  taskId,
  attachments,
  canEdit,
}: TaskDetailAttachmentsProps) {
  const { mutate: uploadAttachment, isPending: isUploading } =
    useUploadTaskAttachment(taskId);
  const { mutate: deleteAttachment, isPending: isDeleting } =
    useDeleteTaskAttachment(taskId);
  const [isDragging, setIsDragging] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] =
    useState<TaskDetailAttachment | null>(null);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (canEdit) {
        setIsDragging(true);
      }
    },
    [canEdit],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (!canEdit) return;

      const files = Array.from(e.dataTransfer.files);
      handleUpload(files);
    },
    [canEdit],
  );

  const handleUpload = async (files: File[] | FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);

    for (const file of fileArray) {
      // 파일 크기 제한 (50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert(`${file.name}의 크기가 너무 큽니다. (최대 50MB)`);
        continue;
      }

      uploadAttachment({ file });
    }
  };

  const handleDeleteClick = (attachment: TaskDetailAttachment) => {
    setAttachmentToDelete(attachment);
  };

  const handleConfirmDelete = () => {
    if (attachmentToDelete) {
      deleteAttachment(attachmentToDelete.id);
      setAttachmentToDelete(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
    if (mimeType.includes("sheet") || mimeType.includes("excel")) return "📊";
    if (mimeType.includes("zip") || mimeType.includes("compressed"))
      return "📦";
    return "📎";
  };

  const fileInputId = `task-attachment-upload-${taskId}`;

  return (
    <div className="space-y-3">
      <input
        id={fileInputId}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
        disabled={isUploading || !canEdit}
      />

      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm flex items-center gap-2">
          📎 첨부 파일 ({attachments.length})
        </h4>
        <label htmlFor={fileInputId} className="cursor-pointer">
          <Button
            variant="outline"
            size="sm"
            disabled={isUploading || !canEdit}
            asChild
          >
            <span>
              {isUploading ? (
                <>
                  <div className="h-4 w-4 mr-1 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  업로드 중...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-1" />
                  파일 추가
                </>
              )}
            </span>
          </Button>
        </label>
      </div>

      {attachments.length > 0 ? (
        <div
          className="space-y-2"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 group py-3 px-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl flex-shrink-0">
                {getFileIcon(attachment.mimeType)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {attachment.originalName}
                  </p>
                  <a
                    href={attachment.s3Url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{formatFileSize(attachment.fileSize)}</span>
                  {attachment.description && (
                    <>
                      <span>•</span>
                      <span className="truncate">{attachment.description}</span>
                    </>
                  )}
                </div>
              </div>
              {canEdit && (
                <button
                  onClick={() => handleDeleteClick(attachment)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <label
          htmlFor={fileInputId}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors block cursor-pointer",
            isDragging
              ? "border-violet-500 bg-violet-50"
              : "border-gray-200 hover:border-violet-300",
            !canEdit && "cursor-not-allowed opacity-50",
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragging ? (
            <>
              <CloudUpload className="h-10 w-10 text-violet-500 mx-auto mb-2 animate-bounce" />
              <p className="text-sm text-violet-600 font-medium">
                파일을 여기에 놓으세요
              </p>
            </>
          ) : (
            <>
              <CloudUpload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">
                {canEdit
                  ? "파일을 드래그하거나 클릭하여 업로드"
                  : "등록된 파일이 없습니다"}
              </p>
              {canEdit && (
                <p className="text-xs text-gray-400 mt-1">
                  최대 50MB까지 업로드 가능합니다
                </p>
              )}
            </>
          )}
        </label>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={!!attachmentToDelete}
        onOpenChange={(open) => !open && setAttachmentToDelete(null)}
        title="첨부파일 삭제"
        description={`"${attachmentToDelete?.originalName || "이 파일"}"을 삭제하시겠습니까?`}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  );
}
