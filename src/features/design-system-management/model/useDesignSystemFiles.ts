"use client";

import { useState, useEffect, useCallback } from "react";
import { designSystemApi } from "../api/designSystemApi";
import type { CategoryFile } from "@/entities/design-system/model/types";

export const useDesignSystemFiles = (categoryId: number | null) => {
  const [files, setFiles] = useState<CategoryFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    if (!categoryId) {
      setFiles([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await designSystemApi.getFiles(categoryId);
      setFiles(data);
    } catch (err) {
      setError("Failed to fetch files");
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return { files, isLoading, error, refetch: fetchFiles };
};

export const useDesignSystemFileMutations = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (categoryId: number, file: File) => {
    setIsUploading(true);
    setError(null);
    try {
      const result = await designSystemApi.uploadFile(categoryId, file);
      return result;
    } catch (err) {
      setError("Failed to upload file");
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteFile = async (fileId: number) => {
    setError(null);
    try {
      await designSystemApi.deleteFile(fileId);
    } catch (err) {
      setError("Failed to delete file");
      throw err;
    }
  };

  const renameFile = async (fileId: number, newName: string) => {
    setError(null);
    try {
      const result = await designSystemApi.renameFile(fileId, newName);
      return result;
    } catch (err) {
      setError("Failed to rename file");
      throw err;
    }
  };

  const downloadFile = async (file: CategoryFile) => {
    try {
      await designSystemApi.downloadFile({
        s3Url: file.s3Url,
        originalName: file.originalName,
      });
    } catch (err) {
      setError("Failed to download file");
      throw err;
    }
  };

  return {
    isUploading,
    error,
    uploadFile,
    deleteFile,
    renameFile,
    downloadFile,
  };
};
