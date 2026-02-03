"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi, type PostsQueryParams } from "../api/postsApi";

// ============================================
// 새 API: 게시판별 조회
// ============================================

export const usePostsByBoard = (
  boardCode: string,
  params: PostsQueryParams = {},
) => {
  return useQuery({
    queryKey: ["posts", boardCode, params],
    queryFn: () => postsApi.getListByBoard(boardCode, params),
    enabled: !!boardCode,
  });
};

export const useCreatePostInBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      boardCode,
      data,
    }: {
      boardCode: string;
      data: { title: string; content: string; isPinned?: boolean };
    }) => postsApi.createInBoard(boardCode, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["posts", variables.boardCode],
      });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

// ============================================
// 기존 API (호환성 유지)
// ============================================

export const usePosts = (params: PostsQueryParams = {}) => {
  return useQuery({
    queryKey: ["posts", params],
    queryFn: () => postsApi.getList(params),
  });
};

export const usePost = (id: number) => {
  return useQuery({
    queryKey: ["post", id],
    queryFn: () => postsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { title?: string; content?: string };
    }) => postsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", variables.id] });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const useTogglePin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postsApi.togglePin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};
