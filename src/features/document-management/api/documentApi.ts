import { api } from "@/shared/api";

export interface DocumentInfo {
  id: number;
  title: string;
  content: string | null;
  originalName: string | null;
  mimeType: string | null;
  fileSize: number | null;
  s3Url: string | null;
  updatedAt: string;
}

export interface DocumentFolder {
  id: number;
  name: string;
  parentId: number | null;
  type: "general" | "figma";
  displayOrder: number;
  children: DocumentFolder[];
  documents: DocumentInfo[];
}

export interface FoldersWithDocumentsResponse {
  folders: DocumentFolder[];
  unassignedDocuments: DocumentInfo[];
}

export interface Document {
  id: number;
  title: string;
  content: string;
  folderId: number | null;
  originalName: string | null;
  storedName: string | null;
  s3Url: string | null;
  filePath: string | null;
  fileSize: number | null;
  mimeType: string | null;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: string;
  updatedAt: string;
}

export const documentApi = {
  // 폴더 + 문서 목록 조회
  getFoldersWithDocuments: async (): Promise<FoldersWithDocumentsResponse> => {
    const response = await api.get("/document-folders");
    return response.data;
  },

  // 폴더 생성
  createFolder: async (data: {
    name: string;
    parentId?: number;
    type?: "general" | "figma";
  }): Promise<DocumentFolder> => {
    const response = await api.post("/document-folders", data);
    return response.data;
  },

  // 폴더 수정
  updateFolder: async (
    id: number,
    data: { name?: string },
  ): Promise<DocumentFolder> => {
    const response = await api.patch(`/document-folders/${id}`, data);
    return response.data;
  },

  // 폴더 순서 변경
  reorderFolders: async (folderIds: number[]): Promise<void> => {
    await api.patch("/document-folders/reorder", { folderIds });
  },

  // 폴더 삭제
  deleteFolder: async (id: number): Promise<void> => {
    await api.delete(`/document-folders/${id}`);
  },

  // 문서 상세 조회
  getDocument: async (id: number): Promise<Document> => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  // 문서 생성
  createDocument: async (data: {
    title: string;
    content?: string;
    folderId?: number;
  }): Promise<Document> => {
    const response = await api.post("/documents", data);
    return response.data;
  },

  // 파일 업로드로 문서 생성
  uploadDocument: async (
    file: File,
    folderId?: number | null,
  ): Promise<Document> => {
    const formData = new FormData();
    formData.append("file", file);
    if (folderId) formData.append("folderId", String(folderId));
    const response = await api.post("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // 다중 파일 업로드
  uploadMultipleDocuments: async (
    files: File[],
    folderId?: number | null,
  ): Promise<Document[]> => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    if (folderId) formData.append("folderId", String(folderId));
    const response = await api.post("/documents/upload/multiple", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // 문서 수정
  updateDocument: async (
    id: number,
    data: { title?: string; content?: string },
  ): Promise<Document> => {
    const response = await api.patch(`/documents/${id}`, data);
    return response.data;
  },

  // 문서 삭제
  deleteDocument: async (id: number): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },

  // 피그마 URL 추가 (documents 테이블 재활용, content에 URL 저장)
  createFigmaDocument: async (data: {
    title: string;
    folderId: number;
    figmaUrl: string;
  }): Promise<Document> => {
    const response = await api.post("/documents", {
      title: data.title,
      folderId: data.folderId,
      content: data.figmaUrl,
    });
    return response.data;
  },

  // 문서 폴더 이동
  moveDocument: async (
    id: number,
    folderId: number | null,
  ): Promise<Document> => {
    const response = await api.patch(`/documents/${id}/folder`, { folderId });
    return response.data;
  },
};
