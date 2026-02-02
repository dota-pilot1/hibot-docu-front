"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskApi } from "../api/taskApi";
import type { UpdateTaskDetailDto } from "../model/types";

/**
 * 업무 상세 조회
 */
export function useTaskDetail(taskId: number) {
  return useQuery({
    queryKey: ["task-detail", taskId],
    queryFn: () => taskApi.getTaskDetail(taskId),
    enabled: !!taskId,
  });
}

/**
 * 업무 상세 수정
 */
export function useUpdateTaskDetail(taskId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTaskDetailDto) =>
      taskApi.updateTaskDetail(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-detail", taskId] });
    },
  });
}

/**
 * 업무 상세 삭제
 */
export function useDeleteTaskDetail(taskId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => taskApi.deleteTaskDetail(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-detail", taskId] });
    },
  });
}

/**
 * 이미지 업로드
 */
export function useUploadTaskImage(taskId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      caption,
      altText,
    }: {
      file: File;
      caption?: string;
      altText?: string;
    }) => taskApi.uploadTaskImage(taskId, file, caption, altText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-detail", taskId] });
    },
  });
}

/**
 * 이미지 정보 수정
 */
export function useUpdateTaskImage(taskId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      imageId,
      data,
    }: {
      imageId: number;
      data: { caption?: string; altText?: string; displayOrder?: number };
    }) => taskApi.updateTaskImage(taskId, imageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-detail", taskId] });
    },
  });
}

/**
 * 이미지 삭제
 */
export function useDeleteTaskImage(taskId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: number) => taskApi.deleteTaskImage(taskId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-detail", taskId] });
    },
  });
}

/**
 * 이미지 순서 변경
 */
export function useReorderTaskImages(taskId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageIds: number[]) =>
      taskApi.reorderTaskImages(taskId, imageIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-detail", taskId] });
    },
  });
}

/**
 * 첨부파일 업로드
 */
export function useUploadTaskAttachment(taskId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      description,
    }: {
      file: File;
      description?: string;
    }) => taskApi.uploadTaskAttachment(taskId, file, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-detail", taskId] });
    },
  });
}

/**
 * 첨부파일 정보 수정
 */
export function useUpdateTaskAttachment(taskId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      attachmentId,
      data,
    }: {
      attachmentId: number;
      data: { description?: string; displayOrder?: number };
    }) => taskApi.updateTaskAttachment(taskId, attachmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-detail", taskId] });
    },
  });
}

/**
 * 첨부파일 삭제
 */
export function useDeleteTaskAttachment(taskId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attachmentId: number) =>
      taskApi.deleteTaskAttachment(taskId, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-detail", taskId] });
    },
  });
}
