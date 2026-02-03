"use client";

import { useAttachments, useDeleteAttachment } from "../model/useAttachments";
import { useUserStore } from "@/entities/user/model/store";
import { Button } from "@/shared/ui/button";
import { File, Download, Trash2, FileText, Image, FileArchive } from "lucide-react";

interface AttachmentListProps {
  postId: number;
  authorId: number;
}

export function AttachmentList({ postId, authorId }: AttachmentListProps) {
  const user = useUserStore((state) => state.user);
  const { data: attachments, isLoading } = useAttachments(postId);
  const { mutate: deleteAttachment } = useDeleteAttachment();

  const isAuthor = user?.userId === authorId;

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <Image className="h-5 w-5" />;
    if (mimeType.includes("pdf")) return <FileText className="h-5 w-5" />;
    if (mimeType.includes("zip") || mimeType.includes("rar"))
      return <FileArchive className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return <div className="animate-pulse h-10 bg-gray-100 rounded"></div>;
  }

  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm text-gray-600">
        첨부파일 ({attachments.length})
      </h4>
      <div className="space-y-1">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center justify-between p-2 bg-gray-50 rounded border"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-gray-500">
                {getFileIcon(attachment.mimeType)}
              </span>
              <span className="truncate text-sm">{attachment.originalName}</span>
              <span className="text-xs text-gray-400 shrink-0">
                ({formatFileSize(attachment.fileSize)})
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {attachment.s3Url && (
                <a
                  href={attachment.s3Url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={attachment.originalName}
                >
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Download className="h-4 w-4" />
                  </Button>
                </a>
              )}
              {isAuthor && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                  onClick={() =>
                    deleteAttachment({ attachmentId: attachment.id, postId })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
