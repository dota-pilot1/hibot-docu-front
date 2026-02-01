"use client";

import { useState, useEffect } from 'react';
import { architectureApi } from '../api/architectureApi';
import type { ArchitectureContent } from '@/entities/architecture/model/types';

export const useArchitectureContents = (categoryId: number | null) => {
    const [contents, setContents] = useState<ArchitectureContent[]>([]);
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
            const data = await architectureApi.getContents(categoryId);
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
