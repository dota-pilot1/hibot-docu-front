import { api } from '@/shared/api';
import type {
    ProjectCategory,
    ProjectContent,
    CreateCategoryRequest,
    UpdateCategoryRequest,
    CreateContentRequest,
    UpdateContentRequest,
    ProjectType,
} from '@/entities/project/model/types';

export const projectApi = {
    // Category endpoints
    getTree: async (): Promise<ProjectCategory[]> => {
        const { data } = await api.get('/projects/tree');
        return data;
    },

    getCategoriesByType: async (type: ProjectType): Promise<ProjectCategory[]> => {
        const { data } = await api.get('/projects/categories', {
            params: { type },
        });
        return data;
    },

    createCategory: async (dto: CreateCategoryRequest): Promise<ProjectCategory> => {
        const { data } = await api.post('/projects/categories', dto);
        return data;
    },

    updateCategory: async (
        id: number,
        dto: UpdateCategoryRequest,
    ): Promise<ProjectCategory> => {
        const { data } = await api.patch(`/projects/categories/${id}`, dto);
        return data;
    },

    deleteCategory: async (id: number): Promise<void> => {
        await api.delete(`/projects/categories/${id}`);
    },

    // Content endpoints
    getContents: async (categoryId: number): Promise<ProjectContent[]> => {
        const { data } = await api.get(`/projects/contents/${categoryId}`);
        return data;
    },

    createContent: async (dto: CreateContentRequest): Promise<ProjectContent> => {
        const { data } = await api.post('/projects/contents', dto);
        return data;
    },

    updateContent: async (
        id: number,
        dto: UpdateContentRequest,
    ): Promise<ProjectContent> => {
        const { data } = await api.patch(`/projects/contents/${id}`, dto);
        return data;
    },

    deleteContent: async (id: number): Promise<void> => {
        await api.delete(`/projects/contents/${id}`);
    },
};
