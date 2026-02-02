"use client";

import { useState, useCallback } from "react";
import {
  useUploadTaskAttachment,
  useDeleteTaskAttachment,
} from "@/entities/task/hooks/useTaskDetail";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { TaskDetailAttachment } from "@/entities/task/model/types";
import { Trash2, Download, CloudUpload, FileIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface TaskDetailAttachmentsProps {
  taskId: number;
  attachments: TaskDetailAttachment[];
}

export function TaskDetailAttachments({
  taskId,
  attachments,
}: TaskDetailAttachmentsProps) {
  const { mutate: uploadAttachment, isPending: isUploading } =
    useUploadTaskAttachment(taskId);
  const { mutate: deleteAttachment, isPending: isDeleting } =
    useDeleteTaskAttachment(taskId);
  const [isDragging, setIsDragging] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] =
    useState<TaskDetailAttachment | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleUpload(files);
  }, []);

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
        disabled={isUploading}
      />

      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-sm flex items-center gap-2">
          📎 첨부 파일 ({attachments.length})
          {isUploading && (
            <div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          )}
        </h4>
      </div>

      {/* 드래그앤드롭 영역 */}
      <label
        htmlFor={fileInputId}
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center transition-colors block cursor-pointer",
          isDragging
            ? "border-violet-500 bg-violet-50"
            : "border-gray-200 hover:border-violet-300",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging ? (
          <>
            <CloudUpload className="h-8 w-8 text-violet-500 mx-auto mb-2 animate-bounce" />
            <p className="text-sm text-violet-600 font-medium">
              파일을 여기에 놓으세요
            </p>
          </>
        ) : (
          <>
            <FileIcon className="h-5 w-5 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500">
              클릭하거나 파일을 드래그하세요
            </p>
          </>
        )}
      </label>

      {/* 파일 목록 */}
      {attachments.length > 0 && (
        <div className="space-y-2 mt-3">
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
              <button
                onClick={() => handleDeleteClick(attachment)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
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
