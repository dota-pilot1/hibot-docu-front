import { api } from "@/shared/api";
import type {
  NoteCategory,
  NoteContent,
  CreateNoteCategoryRequest,
  UpdateNoteCategoryRequest,
  CreateNoteContentRequest,
  UpdateNoteContentRequest,
  NoteType,
  NoteCategoryFile,
} from "@/entities/note/model/types";

export const noteApi = {
  // Category endpoints
  getTree: async (): Promise<NoteCategory[]> => {
    const { data } = await api.get("/notes/tree");
    return data;
  },

  getCategoriesByType: async (type: NoteType): Promise<NoteCategory[]> => {
    const { data } = await api.get("/notes/categories", {
      params: { type },
    });
    return data;
  },

  createCategory: async (
    dto: CreateNoteCategoryRequest,
  ): Promise<NoteCategory> => {
    const { data } = await api.post("/notes/categories", dto);
    return data;
  },

  updateCategory: async (
    id: number,
    dto: UpdateNoteCategoryRequest,
  ): Promise<NoteCategory> => {
    const { data } = await api.patch(`/notes/categories/${id}`, dto);
    return data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/notes/categories/${id}`);
  },

  // Content endpoints
  getContents: async (categoryId: number): Promise<NoteContent[]> => {
    const { data } = await api.get(`/notes/contents/${categoryId}`);
    return data;
  },

  createContent: async (dto: CreateNoteContentRequest): Promise<NoteContent> => {
    const { data } = await api.post("/notes/contents", dto);
    return data;
  },

  updateContent: async (
    id: number,
    dto: UpdateNoteContentRequest,
  ): Promise<NoteContent> => {
    const { data } = await api.patch(`/notes/contents/${id}`, dto);
    return data;
  },

  deleteContent: async (id: number): Promise<void> => {
    await api.delete(`/notes/contents/${id}`);
  },

  reorderCategories: async (
    categoryIds: number[],
    parentId: number | null,
  ): Promise<void> => {
    await api.patch("/notes/categories/reorder", { categoryIds, parentId });
  },

  reorderContents: async (
    categoryId: number,
    contentIds: number[],
  ): Promise<void> => {
    await api.patch("/notes/contents/reorder", { categoryId, contentIds });
  },

  // File endpoints
  getFiles: async (categoryId: number): Promise<NoteCategoryFile[]> => {
    const { data } = await api.get(`/notes/categories/${categoryId}/files`);
    return data;
  },

  uploadFile: async (
    categoryId: number,
    file: File,
  ): Promise<NoteCategoryFile> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post(
      `/notes/categories/${categoryId}/files`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },

  deleteFile: async (fileId: number): Promise<void> => {
    await api.delete(`/notes/files/${fileId}`);
  },

  renameFile: async (
    fileId: number,
    newName: string,
  ): Promise<NoteCategoryFile> => {
    const { data } = await api.patch(`/notes/files/${fileId}/rename`, {
      newName,
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
