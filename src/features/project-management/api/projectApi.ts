import { api } from "@/shared/api";
import type {
  ProjectCategory,
  ProjectContent,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateContentRequest,
  UpdateContentRequest,
  ProjectType,
  CategoryFile,
} from "@/entities/project/model/types";

export const projectApi = {
  // Category endpoints
  getTree: async (): Promise<ProjectCategory[]> => {
    const { data } = await api.get("/projects/tree");
    return data;
  },

  getCategoriesByType: async (
    type: ProjectType,
  ): Promise<ProjectCategory[]> => {
    const { data } = await api.get("/projects/categories", {
      params: { type },
    });
    return data;
  },

  createCategory: async (
    dto: CreateCategoryRequest,
  ): Promise<ProjectCategory> => {
    const { data } = await api.post("/projects/categories", dto);
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
    const { data } = await api.post("/projects/contents", dto);
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

  reorderCategories: async (
    categoryIds: number[],
    parentId: number | null,
  ): Promise<void> => {
    await api.patch("/projects/categories/reorder", { categoryIds, parentId });
  },

  reorderContents: async (
    categoryId: number,
    contentIds: number[],
  ): Promise<void> => {
    await api.patch("/projects/contents/reorder", { categoryId, contentIds });
  },

  // File endpoints
  getFiles: async (categoryId: number): Promise<CategoryFile[]> => {
    const { data } = await api.get(`/projects/categories/${categoryId}/files`);
    return data;
  },

  uploadFile: async (categoryId: number, file: File): Promise<CategoryFile> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post(
      `/projects/categories/${categoryId}/files`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },

  deleteFile: async (fileId: number): Promise<void> => {
    await api.delete(`/projects/files/${fileId}`);
  },

  renameFile: async (
    fileId: number,
    newName: string,
  ): Promise<CategoryFile> => {
    const { data } = await api.patch(`/projects/files/${fileId}/rename`, {
      newName,
    });
    return data;
  },

  downloadFile: async (file: {
    s3Url: string;
    originalName: string;
  }): Promise<void> => {
    // Direct download from S3 URL
    const response = await fetch(file.s3Url);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.originalName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
