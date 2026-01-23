"use client";

import { useState, useEffect } from 'react';
import { projectApi } from '../api/projectApi';
import type { ProjectContent } from '@/entities/project/model/types';

export const useProjectContents = (categoryId: number | null) => {
    const [contents, setContents] = useState<ProjectContent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchContents = async () => {
        if (!categoryId) {
            setContents([]);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const data = await projectApi.getContents(categoryId);
            setContents(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch contents');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchContents();
    }, [categoryId]);

    return { contents, isLoading, error, refetch: fetchContents };
};
