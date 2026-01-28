import { api } from "@/shared/api";

export interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  authorName: string;
  viewCount: number;
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
  // 목록 조회
  getList: async (params: PostsQueryParams = {}): Promise<PostsResponse> => {
    const response = await api.get("/posts", { params });
    return response.data;
  },

  // 상세 조회
  getById: async (id: number): Promise<Post> => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  // 생성
  create: async (data: { title: string; content: string }): Promise<Post> => {
    const response = await api.post("/posts", data);
    return response.data;
  },

  // 수정
  update: async (
    id: number,
    data: { title?: string; content?: string }
  ): Promise<Post> => {
    const response = await api.patch(`/posts/${id}`, data);
    return response.data;
  },

  // 삭제
  delete: async (id: number): Promise<void> => {
    await api.delete(`/posts/${id}`);
  },
};
