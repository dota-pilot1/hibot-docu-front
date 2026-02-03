import { api } from "@/shared/api";

export interface Comment {
  id: number;
  postId: number;
  authorId: number;
  authorName: string;
  authorProfileImage: string | null;
  content: string;
  parentId: number | null;
  depth: number;
  isDeleted: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

export const commentsApi = {
  // 게시글의 댓글 목록 조회
  getByPostId: async (postId: number): Promise<Comment[]> => {
    const response = await api.get(`/posts/${postId}/comments`);
    return response.data;
  },

  // 댓글 작성
  create: async (
    postId: number,
    data: { content: string; parentId?: number }
  ): Promise<Comment> => {
    const response = await api.post(`/posts/${postId}/comments`, data);
    return response.data;
  },

  // 댓글 수정
  update: async (
    commentId: number,
    data: { content: string }
  ): Promise<Comment> => {
    const response = await api.patch(`/comments/${commentId}`, data);
    return response.data;
  },

  // 댓글 삭제
  delete: async (commentId: number): Promise<void> => {
    await api.delete(`/comments/${commentId}`);
  },
};
