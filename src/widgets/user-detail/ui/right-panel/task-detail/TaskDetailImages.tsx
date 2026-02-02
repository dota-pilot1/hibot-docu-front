"use client";

import { useState, useCallback } from "react";
import {
  useUploadTaskImage,
  useDeleteTaskImage,
} from "@/entities/task/hooks/useTaskDetail";

import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { TaskDetailImage } from "@/entities/task/model/types";
import { Trash2, ImageIcon, CloudUpload } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface TaskDetailImagesProps {
  taskId: number;
  images: TaskDetailImage[];
}

export function TaskDetailImages({ taskId, images }: TaskDetailImagesProps) {
  const { mutate: uploadImage, isPending: isUploading } =
    useUploadTaskImage(taskId);
  const { mutate: deleteImage, isPending: isDeleting } =
    useDeleteTaskImage(taskId);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageToDelete, setImageToDelete] = useState<TaskDetailImage | null>(
    null,
  );
  const [isDragging, setIsDragging] = useState(false);

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
      // 이미지 파일만 허용
      if (!file.type.startsWith("image/")) {
        alert(`${file.name}은(는) 이미지 파일이 아닙니다.`);
        continue;
      }

      // 파일 크기 제한 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name}의 크기가 너무 큽니다. (최대 10MB)`);
        continue;
      }

      uploadImage({ file });
    }
  };

  const handleDeleteClick = (image: TaskDetailImage, e: React.MouseEvent) => {
    e.stopPropagation();
    setImageToDelete(image);
  };

  const handleConfirmDelete = () => {
    if (imageToDelete) {
      deleteImage(imageToDelete.id);
      setImageToDelete(null);
    }
  };

  const fileInputId = `task-image-upload-${taskId}`;

  return (
    <div className="space-y-3">
      <input
        id={fileInputId}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
        disabled={isUploading}
      />

      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-sm flex items-center gap-2">
          🖼️ 참고 이미지 ({images.length})
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
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 hover:border-blue-300",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging ? (
          <>
            <CloudUpload className="h-8 w-8 text-blue-500 mx-auto mb-2 animate-bounce" />
            <p className="text-sm text-blue-600 font-medium">
              이미지를 여기에 놓으세요
            </p>
          </>
        ) : (
          <>
            <ImageIcon className="h-5 w-5 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500">
              클릭하거나 이미지를 드래그하세요
            </p>
          </>
        )}
      </label>

      {/* 이미지 그리드 */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mt-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors"
              onClick={() => setSelectedImage(image.s3Url)}
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <img
                  src={image.s3Url}
                  alt={image.altText || image.caption || ""}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <button
                onClick={(e) => handleDeleteClick(image, e)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 truncate">
                  {image.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 이미지 다이얼로그 */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader className="pb-4">
            <DialogTitle>이미지 보기</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[calc(90vh-120px)]">
            <img
              src={selectedImage || ""}
              alt="확대 이미지"
              className="w-full h-auto object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={!!imageToDelete}
        onOpenChange={(open) => !open && setImageToDelete(null)}
        title="이미지 삭제"
        description={`"${imageToDelete?.caption || imageToDelete?.originalName || "이 이미지"}"를 삭제하시겠습니까?`}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  );
}
