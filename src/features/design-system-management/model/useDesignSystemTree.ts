"use client";

import { useState, useEffect } from 'react';
import { designSystemApi } from '../api/designSystemApi';
import type { DesignSystemCategory, DesignSystemType } from '@/entities/design-system/model/types';

export const useDesignSystemTree = (type?: DesignSystemType) => {
    const [tree, setTree] = useState<DesignSystemCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTree = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = type
                ? await designSystemApi.getCategoriesByType(type)
                : await designSystemApi.getTree();
            setTree(data);
        } catch (err) {
            setError('Failed to fetch design system tree');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTree();
    }, [type]);

    return { tree, isLoading, error, refetch: fetchTree };
};
