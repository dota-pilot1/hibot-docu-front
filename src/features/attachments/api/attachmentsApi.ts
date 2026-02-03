import { api } from "@/shared/api";

export interface Attachment {
  id: number;
  postId: number;
  originalName: string;
  storedName: string;
  filePath: string;
  s3Url: string | null;
  fileSize: number;
  mimeType: string;
  displayOrder: number;
  createdAt: string;
}

export const attachmentsApi = {
  // 게시글의 첨부파일 목록
  getByPostId: async (postId: number): Promise<Attachment[]> => {
    const response = await api.get(`/posts/${postId}/attachments`);
    return response.data;
  },

  // 단일 파일 업로드
  upload: async (postId: number, file: File): Promise<Attachment> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(`/posts/${postId}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // 다중 파일 업로드
  uploadMultiple: async (postId: number, files: File[]): Promise<Attachment[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const response = await api.post(
      `/posts/${postId}/attachments/multiple`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  },

  // 첨부파일 삭제
  delete: async (attachmentId: number): Promise<void> => {
    await api.delete(`/attachments/${attachmentId}`);
  },
};
