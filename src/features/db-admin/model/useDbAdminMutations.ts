"use client";

import { useState } from "react";
import { dbAdminApi } from "../api/dbAdminApi";
import type {
  CreateDbAdminCategoryRequest,
  UpdateDbAdminCategoryRequest,
  CreateDbAdminContentRequest,
  UpdateDbAdminContentRequest,
} from "@/entities/db-admin/model/types";

export const useDbAdminMutations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCategory = async (dto: CreateDbAdminCategoryRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await dbAdminApi.createCategory(dto);
      return result;
    } catch (err: any) {
      setError(err.message || "Failed to create category");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategory = async (
    id: number,
    dto: UpdateDbAdminCategoryRequest
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await dbAdminApi.updateCategory(id, dto);
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
      await dbAdminApi.deleteCategory(id);
    } catch (err: any) {
      setError(err.message || "Failed to delete category");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createContent = async (dto: CreateDbAdminContentRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await dbAdminApi.createContent(dto);
      return result;
    } catch (err: any) {
      setError(err.message || "Failed to create content");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateContent = async (id: number, dto: UpdateDbAdminContentRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await dbAdminApi.updateContent(id, dto);
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
      await dbAdminApi.deleteContent(id);
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
