"use client";

import { useState } from 'react';
import { designSystemApi } from '../api/designSystemApi';
import type {
    CreateCategoryRequest,
    UpdateCategoryRequest,
    CreateContentRequest,
    UpdateContentRequest,
} from '@/entities/design-system/model/types';

export const useDesignSystemMutations = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createCategory = async (dto: CreateCategoryRequest) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await designSystemApi.createCategory(dto);
            return result;
        } catch (err) {
            setError('Failed to create category');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateCategory = async (id: number, dto: UpdateCategoryRequest) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await designSystemApi.updateCategory(id, dto);
            return result;
        } catch (err) {
            setError('Failed to update category');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteCategory = async (id: number) => {
        setIsLoading(true);
        setError(null);
        try {
            await designSystemApi.deleteCategory(id);
        } catch (err) {
            setError('Failed to delete category');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const createContent = async (dto: CreateContentRequest) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await designSystemApi.createContent(dto);
            return result;
        } catch (err) {
            setError('Failed to create content');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateContent = async (id: number, dto: UpdateContentRequest) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await designSystemApi.updateContent(id, dto);
            return result;
        } catch (err) {
            setError('Failed to update content');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteContent = async (id: number) => {
        setIsLoading(true);
        setError(null);
        try {
            await designSystemApi.deleteContent(id);
        } catch (err) {
            setError('Failed to delete content');
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
