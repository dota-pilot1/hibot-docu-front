"use client";

import { useState } from "react";
import { reviewApi } from "../api/reviewApi";
import type {
  CreateReviewCategoryRequest,
  UpdateReviewCategoryRequest,
  CreateReviewContentRequest,
  UpdateReviewContentRequest,
} from "@/entities/review/model/types";

export const useReviewMutations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCategory = async (dto: CreateReviewCategoryRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await reviewApi.createCategory(dto);
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
    dto: UpdateReviewCategoryRequest
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await reviewApi.updateCategory(id, dto);
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
      await reviewApi.deleteCategory(id);
    } catch (err: any) {
      setError(err.message || "Failed to delete category");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createContent = async (dto: CreateReviewContentRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await reviewApi.createContent(dto);
      return result;
    } catch (err: any) {
      setError(err.message || "Failed to create content");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateContent = async (id: number, dto: UpdateReviewContentRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await reviewApi.updateContent(id, dto);
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
      await reviewApi.deleteContent(id);
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
