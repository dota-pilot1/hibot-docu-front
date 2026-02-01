"use client";

import { useState, useEffect, useCallback } from "react";
import { architectureApi } from "../api/architectureApi";
import type { CategoryFile } from "@/entities/architecture/model/types";

export const useArchitectureFiles = (categoryId: number | null) => {
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
      const data = await architectureApi.getFiles(categoryId);
      setFiles(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch files");
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

export const useArchitectureFileMutations = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (categoryId: number, file: File) => {
    setIsUploading(true);
    setError(null);
    try {
      const result = await architectureApi.uploadFile(categoryId, file);
      return result;
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteFile = async (fileId: number) => {
    setError(null);
    try {
      await architectureApi.deleteFile(fileId);
    } catch (err: any) {
      setError(err.message || "Failed to delete file");
      throw err;
    }
  };

  const renameFile = async (fileId: number, newName: string) => {
    setError(null);
    try {
      const result = await architectureApi.renameFile(fileId, newName);
      return result;
    } catch (err: any) {
      setError(err.message || "Failed to rename file");
      throw err;
    }
  };

  const downloadFile = async (file: CategoryFile) => {
    try {
      await architectureApi.downloadFile({
        s3Url: file.s3Url,
        originalName: file.originalName,
      });
    } catch (err: any) {
      setError(err.message || "Failed to download file");
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
