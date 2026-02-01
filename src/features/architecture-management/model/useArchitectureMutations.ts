"use client";

import { useState } from 'react';
import { architectureApi } from '../api/architectureApi';
import type {
    CreateCategoryRequest,
    UpdateCategoryRequest,
    CreateContentRequest,
    UpdateContentRequest,
} from '@/entities/architecture/model/types';

export const useArchitectureMutations = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createCategory = async (dto: CreateCategoryRequest) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await architectureApi.createCategory(dto);
            return result;
        } catch (err: any) {
            setError(err.message || 'Failed to create category');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateCategory = async (id: number, dto: UpdateCategoryRequest) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await architectureApi.updateCategory(id, dto);
            return result;
        } catch (err: any) {
            setError(err.message || 'Failed to update category');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteCategory = async (id: number) => {
        setIsLoading(true);
        setError(null);
        try {
            await architectureApi.deleteCategory(id);
        } catch (err: any) {
            setError(err.message || 'Failed to delete category');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const createContent = async (dto: CreateContentRequest) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await architectureApi.createContent(dto);
            return result;
        } catch (err: any) {
            setError(err.message || 'Failed to create content');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateContent = async (id: number, dto: UpdateContentRequest) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await architectureApi.updateContent(id, dto);
            return result;
        } catch (err: any) {
            setError(err.message || 'Failed to update content');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteContent = async (id: number) => {
        setIsLoading(true);
        setError(null);
        try {
            await architectureApi.deleteContent(id);
        } catch (err: any) {
            setError(err.message || 'Failed to delete content');
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
