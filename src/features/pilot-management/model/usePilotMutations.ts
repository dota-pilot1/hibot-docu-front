"use client";

import { useState } from "react";
import { pilotApi } from "../api/pilotApi";
import type {
  CreatePilotCategoryRequest,
  UpdatePilotCategoryRequest,
  CreatePilotContentRequest,
  UpdatePilotContentRequest,
} from "@/entities/pilot/model/types";

export const usePilotMutations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCategory = async (dto: CreatePilotCategoryRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await pilotApi.createCategory(dto);
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
    dto: UpdatePilotCategoryRequest
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await pilotApi.updateCategory(id, dto);
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
      await pilotApi.deleteCategory(id);
    } catch (err: any) {
      setError(err.message || "Failed to delete category");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createContent = async (dto: CreatePilotContentRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await pilotApi.createContent(dto);
      return result;
    } catch (err: any) {
      setError(err.message || "Failed to create content");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateContent = async (id: number, dto: UpdatePilotContentRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await pilotApi.updateContent(id, dto);
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
      await pilotApi.deleteContent(id);
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
