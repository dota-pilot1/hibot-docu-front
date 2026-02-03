import { api } from "@/shared/api";

export interface LikeStatus {
  isLiked: boolean;
  likeCount: number;
}

export const likesApi = {
  // 좋아요 토글
  toggle: async (postId: number): Promise<LikeStatus> => {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  },

  // 좋아요 상태 확인
  getStatus: async (postId: number): Promise<LikeStatus> => {
    const response = await api.get(`/posts/${postId}/like`);
    return response.data;
  },
};
