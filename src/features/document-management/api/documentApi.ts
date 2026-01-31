import { api } from "@/shared/api";

export interface DocumentInfo {
  id: number;
  title: string;
  updatedAt: string;
}

export interface DocumentFolder {
  id: number;
  name: string;
  displayOrder: number;
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
  createFolder: async (data: { name: string }): Promise<DocumentFolder> => {
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

  // 문서 폴더 이동
  moveDocument: async (
    id: number,
    folderId: number | null,
  ): Promise<Document> => {
    const response = await api.patch(`/documents/${id}/folder`, { folderId });
    return response.data;
  },
};
