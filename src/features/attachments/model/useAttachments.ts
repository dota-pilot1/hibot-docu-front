"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attachmentsApi } from "../api/attachmentsApi";

// 게시글의 첨부파일 목록
export function useAttachments(postId: number) {
  return useQuery({
    queryKey: ["attachments", postId],
    queryFn: () => attachmentsApi.getByPostId(postId),
    enabled: !!postId,
  });
}

// 파일 업로드
export function useUploadAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, file }: { postId: number; file: File }) =>
      attachmentsApi.upload(postId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["attachments", variables.postId] });
    },
  });
}

// 다중 파일 업로드
export function useUploadMultipleAttachments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, files }: { postId: number; files: File[] }) =>
      attachmentsApi.uploadMultiple(postId, files),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["attachments", variables.postId] });
    },
  });
}

// 첨부파일 삭제
export function useDeleteAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      attachmentId,
      postId,
    }: {
      attachmentId: number;
      postId: number;
    }) => attachmentsApi.delete(attachmentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["attachments", variables.postId] });
    },
  });
}
