"use client";

import { useState } from "react";
import {
  favoriteApi,
  CreateFavoriteCategoryRequest,
  UpdateFavoriteCategoryRequest,
  CreateFavoriteContentRequest,
  UpdateFavoriteContentRequest,
} from "../api/favoriteApi";

export const useFavoriteMutations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCategory = async (dto: CreateFavoriteCategoryRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await favoriteApi.createCategory(dto);
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
    dto: UpdateFavoriteCategoryRequest
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await favoriteApi.updateCategory(id, dto);
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
      await favoriteApi.deleteCategory(id);
    } catch (err: any) {
      setError(err.message || "Failed to delete category");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createContent = async (dto: CreateFavoriteContentRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await favoriteApi.createContent(dto);
      return result;
    } catch (err: any) {
      setError(err.message || "Failed to create content");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateContent = async (
    id: number,
    dto: UpdateFavoriteContentRequest
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await favoriteApi.updateContent(id, dto);
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
      await favoriteApi.deleteContent(id);
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
