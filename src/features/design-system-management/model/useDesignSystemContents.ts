"use client";

import { useState, useEffect } from 'react';
import { designSystemApi } from '../api/designSystemApi';
import type { DesignSystemContent } from '@/entities/design-system/model/types';

export const useDesignSystemContents = (categoryId: number | null) => {
    const [contents, setContents] = useState<DesignSystemContent[]>([]);
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
            const data = await designSystemApi.getContents(categoryId);
            setContents(data);
        } catch (err) {
            setError('Failed to fetch contents');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchContents();
    }, [categoryId]);

    return { contents, isLoading, error, refetch: fetchContents };
};
