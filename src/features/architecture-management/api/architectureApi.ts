import { api } from "@/shared/api";
import type {
  ArchitectureCategory,
  ArchitectureContent,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateContentRequest,
  UpdateContentRequest,
  ArchitectureType,
  CategoryFile,
} from "@/entities/architecture/model/types";

export const architectureApi = {
  // Category endpoints
  getTree: async (): Promise<ArchitectureCategory[]> => {
    const { data } = await api.get("/architectures/tree");
    return data;
  },

  getCategoriesByType: async (
    type: ArchitectureType,
  ): Promise<ArchitectureCategory[]> => {
    const { data } = await api.get("/architectures/categories", {
      params: { type },
    });
    return data;
  },

  createCategory: async (
    dto: CreateCategoryRequest,
  ): Promise<ArchitectureCategory> => {
    const { data } = await api.post("/architectures/categories", dto);
    return data;
  },

  updateCategory: async (
    id: number,
    dto: UpdateCategoryRequest,
  ): Promise<ArchitectureCategory> => {
    const { data } = await api.patch(`/architectures/categories/${id}`, dto);
    return data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/architectures/categories/${id}`);
  },

  // Content endpoints
  getContents: async (categoryId: number): Promise<ArchitectureContent[]> => {
    const { data } = await api.get(`/architectures/contents/${categoryId}`);
    return data;
  },

  createContent: async (
    dto: CreateContentRequest,
  ): Promise<ArchitectureContent> => {
    const { data } = await api.post("/architectures/contents", dto);
    return data;
  },

  updateContent: async (
    id: number,
    dto: UpdateContentRequest,
  ): Promise<ArchitectureContent> => {
    const { data } = await api.patch(`/architectures/contents/${id}`, dto);
    return data;
  },

  deleteContent: async (id: number): Promise<void> => {
    await api.delete(`/architectures/contents/${id}`);
  },

  reorderCategories: async (
    categoryIds: number[],
    parentId: number | null,
  ): Promise<void> => {
    await api.patch("/architectures/categories/reorder", {
      categoryIds,
      parentId,
    });
  },

  reorderContents: async (
    categoryId: number,
    contentIds: number[],
  ): Promise<void> => {
    await api.patch("/architectures/contents/reorder", {
      categoryId,
      contentIds,
    });
  },

  // File endpoints
  getFiles: async (categoryId: number): Promise<CategoryFile[]> => {
    const { data } = await api.get(
      `/architectures/categories/${categoryId}/files`,
    );
    return data;
  },

  uploadFile: async (categoryId: number, file: File): Promise<CategoryFile> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post(
      `/architectures/categories/${categoryId}/files`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },

  deleteFile: async (fileId: number): Promise<void> => {
    await api.delete(`/architectures/files/${fileId}`);
  },

  renameFile: async (
    fileId: number,
    newName: string,
  ): Promise<CategoryFile> => {
    const { data } = await api.patch(`/architectures/files/${fileId}/rename`, {
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
