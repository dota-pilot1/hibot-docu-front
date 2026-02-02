import { api } from "@/shared/api";
import type {
  FavoriteCategory,
  FavoriteContent,
  FavoriteCategoryFile,
  FavoriteType,
} from "@/entities/favorite/model/types";

export interface CreateFavoriteCategoryRequest {
  name: string;
  favoriteType?: FavoriteType;
  description?: string;
  parentId?: number;
  icon?: string;
}

export interface UpdateFavoriteCategoryRequest {
  name?: string;
  favoriteType?: FavoriteType;
  description?: string;
  parentId?: number;
  icon?: string;
  displayOrder?: number;
}

export interface CreateFavoriteContentRequest {
  categoryId: number;
  title: string;
  content?: string;
  contentType?: FavoriteType;
  metadata?: {
    url?: string;
    language?: string;
    tags?: string[];
  };
}

export interface UpdateFavoriteContentRequest {
  title?: string;
  content?: string;
  contentType?: FavoriteType;
  metadata?: {
    url?: string;
    language?: string;
    tags?: string[];
  };
  displayOrder?: number;
}

export const favoriteApi = {
  // Category endpoints
  getTree: async (): Promise<FavoriteCategory[]> => {
    const { data } = await api.get("/favorites/tree");
    return data;
  },

  createCategory: async (
    dto: CreateFavoriteCategoryRequest
  ): Promise<FavoriteCategory> => {
    const { data } = await api.post("/favorites/categories", dto);
    return data;
  },

  updateCategory: async (
    id: number,
    dto: UpdateFavoriteCategoryRequest
  ): Promise<FavoriteCategory> => {
    const { data } = await api.patch(`/favorites/categories/${id}`, dto);
    return data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/favorites/categories/${id}`);
  },

  // Content endpoints
  getContents: async (categoryId: number): Promise<FavoriteContent[]> => {
    const { data } = await api.get(`/favorites/contents/${categoryId}`);
    return data;
  },

  createContent: async (
    dto: CreateFavoriteContentRequest
  ): Promise<FavoriteContent> => {
    const { data } = await api.post("/favorites/contents", dto);
    return data;
  },

  updateContent: async (
    id: number,
    dto: UpdateFavoriteContentRequest
  ): Promise<FavoriteContent> => {
    const { data } = await api.patch(`/favorites/contents/${id}`, dto);
    return data;
  },

  deleteContent: async (id: number): Promise<void> => {
    await api.delete(`/favorites/contents/${id}`);
  },

  reorderCategories: async (
    categoryIds: number[],
    parentId: number | null
  ): Promise<void> => {
    await api.patch("/favorites/categories/reorder", {
      categoryIds,
      parentId,
    });
  },

  reorderContents: async (
    categoryId: number,
    contentIds: number[]
  ): Promise<void> => {
    await api.patch("/favorites/contents/reorder", {
      categoryId,
      contentIds,
    });
  },

  // File endpoints
  getFiles: async (categoryId: number): Promise<FavoriteCategoryFile[]> => {
    const { data } = await api.get(`/favorites/categories/${categoryId}/files`);
    return data;
  },

  uploadFile: async (
    categoryId: number,
    file: File
  ): Promise<FavoriteCategoryFile> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post(
      `/favorites/categories/${categoryId}/files`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  deleteFile: async (fileId: number): Promise<void> => {
    await api.delete(`/favorites/files/${fileId}`);
  },

  renameFile: async (
    fileId: number,
    newName: string
  ): Promise<FavoriteCategoryFile> => {
    const { data } = await api.patch(`/favorites/files/${fileId}/rename`, {
      name: newName,
    });
    return data;
  },

  downloadFile: async (file: {
    s3Url: string;
    originalName: string;
  }): Promise<void> => {
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
