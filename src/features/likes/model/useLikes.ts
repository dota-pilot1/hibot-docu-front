"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { likesApi, LikeStatus } from "../api/likesApi";

// 좋아요 상태 조회
export function useLikeStatus(postId: number) {
  return useQuery({
    queryKey: ["like", postId],
    queryFn: () => likesApi.getStatus(postId),
    enabled: !!postId,
  });
}

// 좋아요 토글
export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => likesApi.toggle(postId),
    onMutate: async (postId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["like", postId] });
      const previous = queryClient.getQueryData<LikeStatus>(["like", postId]);

      if (previous) {
        queryClient.setQueryData<LikeStatus>(["like", postId], {
          isLiked: !previous.isLiked,
          likeCount: previous.isLiked
            ? previous.likeCount - 1
            : previous.likeCount + 1,
        });
      }

      return { previous };
    },
    onError: (_, postId, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(["like", postId], context.previous);
      }
    },
    onSettled: (_, __, postId) => {
      queryClient.invalidateQueries({ queryKey: ["like", postId] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });
}
