"use client";

import { useCallback, useState } from "react";
import { CloudUpload, X } from "lucide-react";

interface CommonFileUploaderProps {
  onUpload: (file: File) => Promise<void>;
  isUploading?: boolean;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
}

export default function CommonFileUploader({
  onUpload,
  isUploading = false,
  accept,
  multiple = true,
  maxFiles,
  className = "",
}: CommonFileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        const newFiles = maxFiles
          ? files.slice(0, maxFiles - selectedFiles.length)
          : files;
        setSelectedFiles((prev) =>
          maxFiles ? [...prev, ...newFiles].slice(0, maxFiles) : [...prev, ...newFiles]
        );
      }
    },
    [maxFiles, selectedFiles.length]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      if (files.length > 0) {
        const newFiles = maxFiles
          ? files.slice(0, maxFiles - selectedFiles.length)
          : files;
        setSelectedFiles((prev) =>
          maxFiles ? [...prev, ...newFiles].slice(0, maxFiles) : [...prev, ...newFiles]
        );
      }
      e.target.value = "";
    },
    [maxFiles, selectedFiles.length]
  );

  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUploadAll = async () => {
    for (const file of selectedFiles) {
      await onUpload(file);
    }
    setSelectedFiles([]);
  };

  const inputId = `file-upload-${Math.random().toString(36).slice(2)}`;

  return (
    <div className={`space-y-3 ${className}`}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-4 text-center transition-colors
          ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
        `}
      >
        <CloudUpload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 mb-2">
          파일을 드래그하거나 클릭하여 업로드
        </p>
        <input
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          id={inputId}
        />
        <label
          htmlFor={inputId}
          className="inline-block px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
        >
          파일 선택
        </label>
        {maxFiles && (
          <p className="text-xs text-gray-400 mt-2">
            최대 {maxFiles}개 파일
          </p>
        )}
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            선택된 파일 ({selectedFiles.length}개)
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 rounded px-2 py-1"
              >
                <span className="text-sm text-gray-700 truncate flex-1">
                  {file.name}
                </span>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleUploadAll}
            disabled={isUploading}
            className="w-full py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isUploading ? "업로드 중..." : "업로드"}
          </button>
        </div>
      )}
    </div>
  );
}
