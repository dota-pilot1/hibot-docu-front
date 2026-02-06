"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  FileText,
  X,
  Loader2,
  CheckCircle2,
  Eye,
  Download,
  Image,
  FileSpreadsheet,
  FileIcon,
  Trash2,
} from "lucide-react";
import {
  useUploadDocument,
  useUploadMultipleDocuments,
  useFoldersWithDocuments,
  DocumentFolder,
  DocumentInfo,
} from "@/features/document-management";
import { useDocumentStore } from "@/widgets/document-sidebar";
import { Button } from "@/shared/ui/button";
import { BaseDialog } from "@/shared/ui/dialogs/BaseDialog";
import { cn } from "@/shared/lib/utils";

interface DocumentUploadFormProps {
  folderId: number;
}

// 재귀적으로 폴더를 찾는 헬퍼
const findFolderById = (
  folders: DocumentFolder[],
  id: number,
): DocumentFolder | null => {
  for (const folder of folders) {
    if (folder.id === id) return folder;
    const found = findFolderById(folder.children, id);
    if (found) return found;
  }
  return null;
};

const isImageType = (mimeType: string | null) => {
  return mimeType?.startsWith("image/") ?? false;
};

const isPdfType = (mimeType: string | null) => {
  return mimeType === "application/pdf";
};

const getFileIcon = (mimeType: string | null) => {
  if (isImageType(mimeType))
    return <Image className="h-8 w-8 text-green-500" />;
  if (isPdfType(mimeType)) return <FileText className="h-8 w-8 text-red-500" />;
  if (
    mimeType?.includes("spreadsheet") ||
    mimeType?.includes("excel") ||
    mimeType?.includes("csv")
  )
    return <FileSpreadsheet className="h-8 w-8 text-emerald-600" />;
  if (mimeType?.includes("word") || mimeType?.includes("document"))
    return <FileText className="h-8 w-8 text-blue-500" />;
  if (mimeType?.includes("presentation") || mimeType?.includes("powerpoint"))
    return <FileText className="h-8 w-8 text-orange-500" />;
  return <FileIcon className="h-8 w-8 text-zinc-400" />;
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

const FileCard = ({ doc }: { doc: DocumentInfo }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const isImage = isImageType(doc.mimeType);
  const isPdf = isPdfType(doc.mimeType);
  const fileName = doc.originalName || doc.title;

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ((isImage || isPdf) && doc.s3Url) {
      setPreviewOpen(true);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (doc.s3Url) {
      const a = document.createElement("a");
      a.href = doc.s3Url;
      a.download = fileName;
      a.target = "_blank";
      a.click();
    }
  };

  return (
    <>
      <div
        className={cn(
          "group relative border border-zinc-200 dark:border-zinc-700 rounded-lg",
          "hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm",
          "transition-all overflow-hidden",
        )}
      >
        {/* 미리보기 영역 */}
        <div
          className={cn(
            "h-28 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/50 overflow-hidden",
            (isImage || isPdf) && "cursor-pointer",
          )}
          onClick={isImage || isPdf ? handleView : undefined}
        >
          {isImage && doc.s3Url ? (
            <img
              src={doc.s3Url}
              alt={fileName}
              className="h-full w-full object-cover"
            />
          ) : (
            getFileIcon(doc.mimeType)
          )}
        </div>

        {/* 파일 정보 */}
        <div className="px-3 py-2">
          <p className="text-xs font-medium truncate" title={fileName}>
            {fileName}
          </p>
          {doc.fileSize && (
            <p className="text-[10px] text-zinc-400 mt-0.5">
              {formatSize(doc.fileSize)}
            </p>
          )}
        </div>

        {/* 호버 시 액션 버튼 */}
        <div
          className={cn(
            "absolute top-1.5 right-1.5 flex gap-1",
            "opacity-0 group-hover:opacity-100 transition-opacity",
          )}
        >
          {(isImage || isPdf) && (
            <button
              onClick={handleView}
              className="p-1.5 rounded-md bg-white/90 dark:bg-zinc-800/90 shadow-sm hover:bg-white dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-600"
              title="보기"
            >
              <Eye className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-300" />
            </button>
          )}
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-md bg-white/90 dark:bg-zinc-800/90 shadow-sm hover:bg-white dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-600"
            title="다운로드"
          >
            <Download className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-300" />
          </button>
        </div>
      </div>

      {/* 미리보기 다이얼로그 */}
      <BaseDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title={fileName}
        maxWidth="max-w-4xl"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              다운로드
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(false)}
            >
              닫기
            </Button>
          </div>
        }
      >
        <div className="flex items-center justify-center min-h-[300px] max-h-[70vh] overflow-auto">
          {isImage && doc.s3Url && (
            <img
              src={doc.s3Url}
              alt={fileName}
              className="max-w-full max-h-[65vh] object-contain rounded"
            />
          )}
          {isPdf && doc.s3Url && (
            <iframe
              src={doc.s3Url}
              className="w-full h-[65vh] rounded border-0"
              title={fileName}
            />
          )}
        </div>
      </BaseDialog>
    </>
  );
};

export const DocumentUploadForm = ({ folderId }: DocumentUploadFormProps) => {
  const { data } = useFoldersWithDocuments();
  const uploadDocument = useUploadDocument();
  const uploadMultiple = useUploadMultipleDocuments();
  const openTab = useDocumentStore((s) => s.openTab);

  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 현재 선택된 폴더 정보
  const folder = data ? findFolderById(data.folders, folderId) : null;
  const folderName = folder?.name ?? "폴더";

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setSelectedFiles((prev) => [...prev, ...Array.from(files)]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadedCount(0);

    try {
      if (selectedFiles.length === 1) {
        const doc = await uploadDocument.mutateAsync({
          file: selectedFiles[0],
          folderId,
        });
        setUploadedCount(1);
        openTab({ id: doc.id, title: doc.title });
      } else {
        await uploadMultiple.mutateAsync({
          files: selectedFiles,
          folderId,
        });
        setUploadedCount(selectedFiles.length);
      }
      setSelectedFiles([]);
    } catch (e) {
      console.error("Upload failed:", e);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">{folderName}</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            이 폴더에 파일을 업로드하세요
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-1" />
          파일 추가
        </Button>
      </div>

      {/* 콘텐츠 영역 */}
      <div
        className="flex-1 overflow-auto p-6"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.txt,.csv,.hwp,.jpg,.jpeg,.png,.gif,.webp,.svg,.zip,.rar,.7z"
        />

        {/* 드래그 오버레이 */}
        {isDragOver && (
          <div className="fixed inset-0 z-50 pointer-events-none">
            <div className="absolute inset-6 border-2 border-dashed border-blue-400 rounded-xl bg-blue-50/80 dark:bg-blue-900/30 flex items-center justify-center">
              <div className="text-center">
                <Upload className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-600">
                  여기에 파일을 놓으세요
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 선택된 파일 (업로드 대기) */}
        {selectedFiles.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">
                업로드 대기 ({selectedFiles.length})
              </h3>
              <Button size="sm" onClick={handleUpload} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    업로드 중...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-1" />
                    업로드
                  </>
                )}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                >
                  <FileText className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  <span className="text-xs truncate max-w-[150px]">
                    {file.name}
                  </span>
                  <span className="text-[10px] text-zinc-400 shrink-0">
                    {formatSize(file.size)}
                  </span>
                  {!isUploading && (
                    <button
                      onClick={() => removeFile(index)}
                      className="p-0.5 rounded hover:bg-blue-100 dark:hover:bg-blue-800"
                    >
                      <X className="h-3 w-3 text-blue-400" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 업로드 완료 메시지 */}
        {uploadedCount > 0 && !isUploading && selectedFiles.length === 0 && (
          <div className="mb-6 flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle2 className="h-4 w-4" />
            {uploadedCount}개 파일이 업로드되었습니다.
          </div>
        )}

        {/* 파일 카드 그리드 */}
        {folder && folder.documents.length > 0 ? (
          <div>
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">
              파일 ({folder.documents.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {folder.documents.map((doc) => (
                <FileCard key={doc.id} doc={doc} />
              ))}
            </div>
          </div>
        ) : (
          !selectedFiles.length && (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
              <Upload className="h-10 w-10 mb-3" />
              <p className="text-sm">
                파일을 드래그하거나 상단 버튼으로 추가하세요
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};
