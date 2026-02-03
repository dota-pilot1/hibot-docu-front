"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commentsApi } from "../api/commentsApi";

// 게시글의 댓글 목록 조회
export function useComments(postId: number) {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: () => commentsApi.getByPostId(postId),
    enabled: !!postId,
  });
}

// 댓글 작성
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      data,
    }: {
      postId: number;
      data: { content: string; parentId?: number };
    }) => commentsApi.create(postId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
      queryClient.invalidateQueries({ queryKey: ["post", variables.postId] });
    },
  });
}

// 댓글 수정
export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      postId,
      data,
    }: {
      commentId: number;
      postId: number;
      data: { content: string };
    }) => commentsApi.update(commentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
    },
  });
}

// 댓글 삭제
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      postId,
    }: {
      commentId: number;
      postId: number;
    }) => commentsApi.delete(commentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
      queryClient.invalidateQueries({ queryKey: ["post", variables.postId] });
    },
  });
}
