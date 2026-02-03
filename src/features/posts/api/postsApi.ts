import { api } from "@/shared/api";

export interface Post {
  id: number;
  boardId: number;
  title: string;
  content: string;
  authorId: number;
  authorName: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isPinned: boolean;
  status: "DRAFT" | "PUBLISHED" | "HIDDEN";
  boardCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostsResponse {
  data: Post[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PostsQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

export const postsApi = {
  // ============================================
  // 새 API: /boards/:boardCode/posts
  // ============================================

  // 게시판별 목록 조회
  getListByBoard: async (
    boardCode: string,
    params: PostsQueryParams = {},
  ): Promise<PostsResponse> => {
    const response = await api.get(`/boards/${boardCode}/posts`, { params });
    return response.data;
  },

  // 게시판에 게시글 생성
  createInBoard: async (
    boardCode: string,
    data: { title: string; content: string; isPinned?: boolean },
  ): Promise<Post> => {
    const response = await api.post(`/boards/${boardCode}/posts`, data);
    return response.data;
  },

  // ============================================
  // 기존 API (호환성 유지)
  // ============================================

  // 목록 조회 (전체)
  getList: async (params: PostsQueryParams = {}): Promise<PostsResponse> => {
    const response = await api.get("/posts", { params });
    return response.data;
  },

  // 상세 조회
  getById: async (id: number): Promise<Post> => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  // 생성 (기본 게시판)
  create: async (data: { title: string; content: string }): Promise<Post> => {
    const response = await api.post("/posts", data);
    return response.data;
  },

  // 수정
  update: async (
    id: number,
    data: { title?: string; content?: string },
  ): Promise<Post> => {
    const response = await api.patch(`/posts/${id}`, data);
    return response.data;
  },

  // 삭제
  delete: async (id: number): Promise<void> => {
    await api.delete(`/posts/${id}`);
  },

  // 상단 고정 토글 (ADMIN)
  togglePin: async (id: number): Promise<Post> => {
    const response = await api.patch(`/posts/${id}/pin`);
    return response.data;
  },
};
