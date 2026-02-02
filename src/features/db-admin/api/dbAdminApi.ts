import { api } from "@/shared/api";
import type {
  DbAdminCategory,
  DbAdminContent,
  CreateDbAdminCategoryRequest,
  UpdateDbAdminCategoryRequest,
  CreateDbAdminContentRequest,
  UpdateDbAdminContentRequest,
  DbAdminType,
  DbAdminCategoryFile,
} from "@/entities/db-admin/model/types";

export const dbAdminApi = {
  // Category endpoints
  getTree: async (): Promise<DbAdminCategory[]> => {
    const { data } = await api.get("/db-admin/tree");
    return data;
  },

  getCategoriesByType: async (type: DbAdminType): Promise<DbAdminCategory[]> => {
    const { data } = await api.get("/db-admin/categories", {
      params: { type },
    });
    return data;
  },

  createCategory: async (
    dto: CreateDbAdminCategoryRequest
  ): Promise<DbAdminCategory> => {
    const { data } = await api.post("/db-admin/categories", dto);
    return data;
  },

  updateCategory: async (
    id: number,
    dto: UpdateDbAdminCategoryRequest
  ): Promise<DbAdminCategory> => {
    const { data } = await api.patch(`/db-admin/categories/${id}`, dto);
    return data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/db-admin/categories/${id}`);
  },

  // Content endpoints
  getContents: async (categoryId: number): Promise<DbAdminContent[]> => {
    const { data } = await api.get(`/db-admin/contents/${categoryId}`);
    return data;
  },

  createContent: async (
    dto: CreateDbAdminContentRequest
  ): Promise<DbAdminContent> => {
    const { data } = await api.post("/db-admin/contents", dto);
    return data;
  },

  updateContent: async (
    id: number,
    dto: UpdateDbAdminContentRequest
  ): Promise<DbAdminContent> => {
    const { data } = await api.patch(`/db-admin/contents/${id}`, dto);
    return data;
  },

  deleteContent: async (id: number): Promise<void> => {
    await api.delete(`/db-admin/contents/${id}`);
  },

  reorderCategories: async (
    categoryIds: number[],
    parentId: number | null
  ): Promise<void> => {
    await api.patch("/db-admin/categories/reorder", {
      categoryIds,
      parentId,
    });
  },

  reorderContents: async (
    categoryId: number,
    contentIds: number[]
  ): Promise<void> => {
    await api.patch("/db-admin/contents/reorder", {
      categoryId,
      contentIds,
    });
  },

  // File endpoints
  getFiles: async (categoryId: number): Promise<DbAdminCategoryFile[]> => {
    const { data } = await api.get(`/db-admin/categories/${categoryId}/files`);
    return data;
  },

  uploadFile: async (
    categoryId: number,
    file: File
  ): Promise<DbAdminCategoryFile> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post(
      `/db-admin/categories/${categoryId}/files`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  deleteFile: async (fileId: number): Promise<void> => {
    await api.delete(`/db-admin/files/${fileId}`);
  },

  renameFile: async (
    fileId: number,
    newName: string
  ): Promise<DbAdminCategoryFile> => {
    const { data } = await api.patch(`/db-admin/files/${fileId}/rename`, {
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
