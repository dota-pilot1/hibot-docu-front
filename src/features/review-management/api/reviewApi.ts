import { api } from "@/shared/api";
import type {
  ReviewCategory,
  ReviewContent,
  CreateReviewCategoryRequest,
  UpdateReviewCategoryRequest,
  CreateReviewContentRequest,
  UpdateReviewContentRequest,
  ReviewType,
  ReviewCategoryFile,
} from "@/entities/review/model/types";

export const reviewApi = {
  // Category endpoints
  getTree: async (): Promise<ReviewCategory[]> => {
    const { data } = await api.get("/reviews/tree");
    return data;
  },

  getCategoriesByType: async (type: ReviewType): Promise<ReviewCategory[]> => {
    const { data } = await api.get("/reviews/categories", {
      params: { type },
    });
    return data;
  },

  createCategory: async (
    dto: CreateReviewCategoryRequest
  ): Promise<ReviewCategory> => {
    const { data } = await api.post("/reviews/categories", dto);
    return data;
  },

  updateCategory: async (
    id: number,
    dto: UpdateReviewCategoryRequest
  ): Promise<ReviewCategory> => {
    const { data } = await api.patch(`/reviews/categories/${id}`, dto);
    return data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/reviews/categories/${id}`);
  },

  // Content endpoints
  getContents: async (categoryId: number): Promise<ReviewContent[]> => {
    const { data } = await api.get(`/reviews/contents/${categoryId}`);
    return data;
  },

  createContent: async (
    dto: CreateReviewContentRequest
  ): Promise<ReviewContent> => {
    const { data } = await api.post("/reviews/contents", dto);
    return data;
  },

  updateContent: async (
    id: number,
    dto: UpdateReviewContentRequest
  ): Promise<ReviewContent> => {
    const { data } = await api.patch(`/reviews/contents/${id}`, dto);
    return data;
  },

  deleteContent: async (id: number): Promise<void> => {
    await api.delete(`/reviews/contents/${id}`);
  },

  reorderCategories: async (
    categoryIds: number[],
    parentId: number | null
  ): Promise<void> => {
    await api.patch("/reviews/categories/reorder", {
      categoryIds,
      parentId,
    });
  },

  reorderContents: async (
    categoryId: number,
    contentIds: number[]
  ): Promise<void> => {
    await api.patch("/reviews/contents/reorder", {
      categoryId,
      contentIds,
    });
  },

  // File endpoints
  getFiles: async (categoryId: number): Promise<ReviewCategoryFile[]> => {
    const { data } = await api.get(`/reviews/categories/${categoryId}/files`);
    return data;
  },

  uploadFile: async (
    categoryId: number,
    file: File
  ): Promise<ReviewCategoryFile> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post(
      `/reviews/categories/${categoryId}/files`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  deleteFile: async (fileId: number): Promise<void> => {
    await api.delete(`/reviews/files/${fileId}`);
  },

  renameFile: async (
    fileId: number,
    newName: string
  ): Promise<ReviewCategoryFile> => {
    const { data } = await api.patch(`/reviews/files/${fileId}/rename`, {
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
