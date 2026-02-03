import { api } from "@/shared/api";
import type {
  DesignSystemCategory,
  DesignSystemContent,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateContentRequest,
  UpdateContentRequest,
  DesignSystemType,
  CategoryFile,
} from "@/entities/design-system/model/types";

export const designSystemApi = {
  // Category endpoints
  getTree: async (): Promise<DesignSystemCategory[]> => {
    const { data } = await api.get("/design-systems/tree");
    return data;
  },

  getCategoriesByType: async (
    type: DesignSystemType,
  ): Promise<DesignSystemCategory[]> => {
    const { data } = await api.get("/design-systems/categories", {
      params: { type },
    });
    return data;
  },

  createCategory: async (
    dto: CreateCategoryRequest,
  ): Promise<DesignSystemCategory> => {
    const { data } = await api.post("/design-systems/categories", dto);
    return data;
  },

  updateCategory: async (
    id: number,
    dto: UpdateCategoryRequest,
  ): Promise<DesignSystemCategory> => {
    const { data } = await api.patch(`/design-systems/categories/${id}`, dto);
    return data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/design-systems/categories/${id}`);
  },

  // Content endpoints
  getContents: async (categoryId: number): Promise<DesignSystemContent[]> => {
    const { data } = await api.get(`/design-systems/contents/${categoryId}`);
    return data;
  },

  createContent: async (
    dto: CreateContentRequest,
  ): Promise<DesignSystemContent> => {
    const { data } = await api.post("/design-systems/contents", dto);
    return data;
  },

  updateContent: async (
    id: number,
    dto: UpdateContentRequest,
  ): Promise<DesignSystemContent> => {
    const { data } = await api.patch(`/design-systems/contents/${id}`, dto);
    return data;
  },

  deleteContent: async (id: number): Promise<void> => {
    await api.delete(`/design-systems/contents/${id}`);
  },

  reorderCategories: async (
    categoryIds: number[],
    parentId: number | null,
  ): Promise<void> => {
    await api.patch("/design-systems/categories/reorder", {
      categoryIds,
      parentId,
    });
  },

  reorderContents: async (
    categoryId: number,
    contentIds: number[],
  ): Promise<void> => {
    await api.patch("/design-systems/contents/reorder", {
      categoryId,
      contentIds,
    });
  },

  // File endpoints
  getFiles: async (categoryId: number): Promise<CategoryFile[]> => {
    const { data } = await api.get(
      `/design-systems/categories/${categoryId}/files`,
    );
    return data;
  },

  uploadFile: async (categoryId: number, file: File): Promise<CategoryFile> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post(
      `/design-systems/categories/${categoryId}/files`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },

  deleteFile: async (fileId: number): Promise<void> => {
    await api.delete(`/design-systems/files/${fileId}`);
  },

  renameFile: async (
    fileId: number,
    newName: string,
  ): Promise<CategoryFile> => {
    const { data } = await api.patch(`/design-systems/files/${fileId}/rename`, {
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
