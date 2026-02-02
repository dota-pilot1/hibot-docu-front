import { api } from "@/shared/api";
import type {
  PilotCategory,
  PilotContent,
  CreatePilotCategoryRequest,
  UpdatePilotCategoryRequest,
  CreatePilotContentRequest,
  UpdatePilotContentRequest,
  PilotType,
  PilotCategoryFile,
} from "@/entities/pilot/model/types";

export const pilotApi = {
  // Category endpoints
  getTree: async (): Promise<PilotCategory[]> => {
    const { data } = await api.get("/pilots/tree");
    return data;
  },

  getCategoriesByType: async (type: PilotType): Promise<PilotCategory[]> => {
    const { data } = await api.get("/pilots/categories", {
      params: { type },
    });
    return data;
  },

  createCategory: async (
    dto: CreatePilotCategoryRequest
  ): Promise<PilotCategory> => {
    const { data } = await api.post("/pilots/categories", dto);
    return data;
  },

  updateCategory: async (
    id: number,
    dto: UpdatePilotCategoryRequest
  ): Promise<PilotCategory> => {
    const { data } = await api.patch(`/pilots/categories/${id}`, dto);
    return data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/pilots/categories/${id}`);
  },

  // Content endpoints
  getContents: async (categoryId: number): Promise<PilotContent[]> => {
    const { data } = await api.get(`/pilots/contents/${categoryId}`);
    return data;
  },

  createContent: async (
    dto: CreatePilotContentRequest
  ): Promise<PilotContent> => {
    const { data } = await api.post("/pilots/contents", dto);
    return data;
  },

  updateContent: async (
    id: number,
    dto: UpdatePilotContentRequest
  ): Promise<PilotContent> => {
    const { data } = await api.patch(`/pilots/contents/${id}`, dto);
    return data;
  },

  deleteContent: async (id: number): Promise<void> => {
    await api.delete(`/pilots/contents/${id}`);
  },

  reorderCategories: async (
    categoryIds: number[],
    parentId: number | null
  ): Promise<void> => {
    await api.patch("/pilots/categories/reorder", {
      categoryIds,
      parentId,
    });
  },

  reorderContents: async (
    categoryId: number,
    contentIds: number[]
  ): Promise<void> => {
    await api.patch("/pilots/contents/reorder", {
      categoryId,
      contentIds,
    });
  },

  // File endpoints
  getFiles: async (categoryId: number): Promise<PilotCategoryFile[]> => {
    const { data } = await api.get(`/pilots/categories/${categoryId}/files`);
    return data;
  },

  uploadFile: async (
    categoryId: number,
    file: File
  ): Promise<PilotCategoryFile> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post(
      `/pilots/categories/${categoryId}/files`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  deleteFile: async (fileId: number): Promise<void> => {
    await api.delete(`/pilots/files/${fileId}`);
  },

  renameFile: async (
    fileId: number,
    newName: string
  ): Promise<PilotCategoryFile> => {
    const { data } = await api.patch(`/pilots/files/${fileId}/rename`, {
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
