"use client";

import { useState, useEffect } from 'react';
import { architectureApi } from '../api/architectureApi';
import type { ArchitectureCategory, ArchitectureType } from '@/entities/architecture/model/types';

export const useArchitectureTree = (type?: ArchitectureType) => {
    const [tree, setTree] = useState<ArchitectureCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTree = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = type
                ? await architectureApi.getCategoriesByType(type)
                : await architectureApi.getTree();
            setTree(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch project tree');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTree();
    }, [type]);

    return { tree, isLoading, error, refetch: fetchTree };
};
