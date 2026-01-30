"use client";

import { useState } from "react";
import { noteApi } from "../api/noteApi";
import type {
  CreateNoteCategoryRequest,
  UpdateNoteCategoryRequest,
  CreateNoteContentRequest,
  UpdateNoteContentRequest,
} from "@/entities/note/model/types";

export const useNoteMutations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCategory = async (dto: CreateNoteCategoryRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await noteApi.createCategory(dto);
      return result;
    } catch (err: any) {
      setError(err.message || "Failed to create category");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategory = async (id: number, dto: UpdateNoteCategoryRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await noteApi.updateCategory(id, dto);
      return result;
    } catch (err: any) {
      setError(err.message || "Failed to update category");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await noteApi.deleteCategory(id);
    } catch (err: any) {
      setError(err.message || "Failed to delete category");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createContent = async (dto: CreateNoteContentRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await noteApi.createContent(dto);
      return result;
    } catch (err: any) {
      setError(err.message || "Failed to create content");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateContent = async (id: number, dto: UpdateNoteContentRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await noteApi.updateContent(id, dto);
      return result;
    } catch (err: any) {
      setError(err.message || "Failed to update content");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteContent = async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await noteApi.deleteContent(id);
    } catch (err: any) {
      setError(err.message || "Failed to delete content");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    createContent,
    updateContent,
    deleteContent,
  };
};
