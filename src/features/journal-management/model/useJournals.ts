"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  journalApi,
  type JournalType,
  type CreateJournalCategoryRequest,
  type UpdateJournalCategoryRequest,
  type CreateJournalRequest,
  type UpdateJournalRequest,
} from "../api/journalApi";

// Query Keys
export const journalKeys = {
  all: ["journals"] as const,
  tree: (type?: JournalType) => [...journalKeys.all, "tree", type] as const,
  lists: () => [...journalKeys.all, "list"] as const,
  list: (categoryId?: number) => [...journalKeys.lists(), categoryId] as const,
  detail: (id: number) => [...journalKeys.all, "detail", id] as const,
};

// ============================================
// Category Queries & Mutations
// ============================================

export const useJournalTree = (type?: JournalType) => {
  return useQuery({
    queryKey: journalKeys.tree(type),
    queryFn: () => journalApi.getTree(type),
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateJournalCategoryRequest) =>
      journalApi.createCategory(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalKeys.all });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: number;
      dto: UpdateJournalCategoryRequest;
    }) => journalApi.updateCategory(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalKeys.all });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => journalApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalKeys.all });
    },
  });
};

// ============================================
// Journal Queries & Mutations
// ============================================

export const useJournalList = (categoryId?: number) => {
  return useQuery({
    queryKey: journalKeys.list(categoryId),
    queryFn: () => journalApi.getJournals(categoryId),
    enabled: !!categoryId,
  });
};

export const useJournal = (id: number) => {
  return useQuery({
    queryKey: journalKeys.detail(id),
    queryFn: () => journalApi.getJournalById(id),
    enabled: !!id,
  });
};

export const useCreateJournal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateJournalRequest) => journalApi.createJournal(dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: journalKeys.list(variables.categoryId),
      });
    },
  });
};

export const useUpdateJournal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateJournalRequest }) =>
      journalApi.updateJournal(id, dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: journalKeys.list(data.categoryId),
      });
      queryClient.invalidateQueries({
        queryKey: journalKeys.detail(data.id),
      });
    },
  });
};

export const useDeleteJournal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => journalApi.deleteJournal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalKeys.lists() });
    },
  });
};

export const useReorderJournals = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      journalIds,
    }: {
      categoryId: number;
      journalIds: number[];
    }) => journalApi.reorderJournals(categoryId, journalIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: journalKeys.list(variables.categoryId),
      });
    },
  });
};
