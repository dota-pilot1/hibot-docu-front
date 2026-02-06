"use client";

import {
  FileText,
  Image,
  FileSpreadsheet,
  FileArchive,
  File,
  Download,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { useDocument, useDeleteDocument } from "@/features/document-management";
import { useDocumentStore } from "@/widgets/document-sidebar";
import { Button } from "@/shared/ui/button";
import { api } from "@/shared/api";
import { cn } from "@/shared/lib/utils";

interface DocumentFileViewerProps {
  documentId: number;
}

const getFileIcon = (mimeType: string | null, size: "sm" | "lg" = "sm") => {
  const cls = size === "lg" ? "h-16 w-16" : "h-5 w-5";

  if (!mimeType)
    return <FileText className={cn(cls, "text-zinc-400")} />;
  if (mimeType.startsWith("image/"))
    return <Image className={cn(cls, "text-green-500")} />;
  if (mimeType === "application/pdf")
    return <FileText className={cn(cls, "text-red-500")} />;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType === "text/csv")
    return <FileSpreadsheet className={cn(cls, "text-emerald-600")} />;
  if (mimeType.includes("word") || mimeType.includes("document") || mimeType === "application/hwp" || mimeType === "application/x-hwp")
    return <FileText className={cn(cls, "text-blue-500")} />;
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return <FileText className={cn(cls, "text-orange-500")} />;
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("archive"))
    return <FileArchive className={cn(cls, "text-yellow-600")} />;
  return <File className={cn(cls, "text-zinc-400")} />;
};

const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileTypeLabel = (mimeType: string | null): string => {
  if (!mimeType) return "파일";
  if (mimeType.startsWith("image/")) return "이미지";
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "Excel";
  if (mimeType.includes("word") || mimeType.includes("document")) return "Word";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "PowerPoint";
  if (mimeType === "application/hwp" || mimeType === "application/x-hwp") return "HWP";
  if (mimeType === "text/csv") return "CSV";
  if (mimeType === "text/plain") return "텍스트";
  if (mimeType.includes("zip") || mimeType.includes("rar")) return "압축파일";
  return "파일";
};

const isPreviewable = (mimeType: string | null): boolean => {
  if (!mimeType) return false;
  return mimeType.startsWith("image/") || mimeType === "application/pdf";
};

export const DocumentFileViewer = ({ documentId }: DocumentFileViewerProps) => {
  const { data: doc, isLoading, error } = useDocument(documentId);
  const deleteDocument = useDeleteDocument();
  const closeTab = useDocumentStore((s) => s.closeTab);

  const handleDownload = async () => {
    if (!doc) return;

    try {
      const response = await api.get(`/documents/${doc.id}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", doc.originalName || doc.title);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download failed:", e);
    }
  };

  const handleDelete = async () => {
    if (!doc) return;
    if (!confirm("문서를 삭제하시겠습니까?")) return;

    await deleteDocument.mutateAsync(doc.id);
    closeTab(doc.id);
  };

  const handleOpenInNewTab = () => {
    if (doc?.s3Url) {
      window.open(doc.s3Url, "_blank");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-400">
        로딩 중...
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        문서를 불러올 수 없습니다.
      </div>
    );
  }

  // 파일이 없는 문서 (기존 텍스트 문서)
  if (!doc.s3Url) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-2">
        <FileText className="h-16 w-16" />
        <p>파일이 없는 문서입니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 파일 정보 헤더 */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
        {getFileIcon(doc.mimeType, "sm")}
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold truncate">
            {doc.originalName || doc.title}
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            {getFileTypeLabel(doc.mimeType)} · {formatFileSize(doc.fileSize)} ·{" "}
            {new Date(doc.updatedAt).toLocaleDateString("ko-KR")} 업로드
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {doc.s3Url && (
            <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
              <ExternalLink className="h-4 w-4 mr-1" />
              새 탭
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-1" />
            다운로드
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            삭제
          </Button>
        </div>
      </div>

      {/* 미리보기 영역 */}
      <div className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-900">
        {doc.mimeType?.startsWith("image/") ? (
          <div className="flex items-center justify-center h-full p-8">
            <img
              src={doc.s3Url}
              alt={doc.originalName || doc.title}
              className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
            />
          </div>
        ) : doc.mimeType === "application/pdf" ? (
          <iframe
            src={doc.s3Url}
            className="w-full h-full border-0"
            title={doc.originalName || doc.title}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-4">
            {getFileIcon(doc.mimeType, "lg")}
            <div className="text-center">
              <p className="text-lg font-medium text-zinc-600 dark:text-zinc-300">
                {doc.originalName || doc.title}
              </p>
              <p className="text-sm mt-1">
                미리보기를 지원하지 않는 파일 형식입니다.
              </p>
              <p className="text-sm">다운로드하여 확인하세요.</p>
            </div>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              파일 다운로드
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
