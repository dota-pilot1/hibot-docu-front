"use client";

import { useState, useEffect, useCallback } from "react";
import { favoriteApi } from "../api/favoriteApi";
import type { FavoriteCategoryFile } from "@/entities/favorite/model/types";

export const useFavoriteFiles = (categoryId: number | null) => {
  const [files, setFiles] = useState<FavoriteCategoryFile[]>([]);
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
      const data = await favoriteApi.getFiles(categoryId);
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

export const useFavoriteFileMutations = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (categoryId: number, file: File) => {
    setIsUploading(true);
    setError(null);
    try {
      const result = await favoriteApi.uploadFile(categoryId, file);
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
      await favoriteApi.deleteFile(fileId);
    } catch (err: any) {
      setError(err.message || "Failed to delete file");
      throw err;
    }
  };

  const renameFile = async (fileId: number, newName: string) => {
    setError(null);
    try {
      const result = await favoriteApi.renameFile(fileId, newName);
      return result;
    } catch (err: any) {
      setError(err.message || "Failed to rename file");
      throw err;
    }
  };

  const downloadFile = async (file: FavoriteCategoryFile) => {
    try {
      await favoriteApi.downloadFile({
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
