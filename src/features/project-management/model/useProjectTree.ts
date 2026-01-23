"use client";

import { useState, useEffect } from 'react';
import { projectApi } from '../api/projectApi';
import type { ProjectCategory, ProjectType } from '@/entities/project/model/types';

export const useProjectTree = (type?: ProjectType) => {
    const [tree, setTree] = useState<ProjectCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTree = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = type
                ? await projectApi.getCategoriesByType(type)
                : await projectApi.getTree();
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
