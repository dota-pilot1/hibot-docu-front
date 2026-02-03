import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { skillApi } from "../api/skillApi";
import type { CreateSkillInput, UpdateSkillInput } from "../model/types";

// Query Keys
export const skillKeys = {
  all: ["skills"] as const,
  list: () => [...skillKeys.all, "list"] as const,
  withUserLevels: (userId: number) =>
    [...skillKeys.all, "withUserLevels", userId] as const,
  detail: (id: number) => [...skillKeys.all, "detail", id] as const,
};

// ============================================
// Skills Hooks
// ============================================

export const useAllSkills = () => {
  return useQuery({
    queryKey: skillKeys.list(),
    queryFn: async () => {
      const { data } = await skillApi.getAll();
      return data;
    },
  });
};

export const useSkillsWithUserLevels = (userId: number) => {
  return useQuery({
    queryKey: skillKeys.withUserLevels(userId),
    queryFn: async () => {
      const { data } = await skillApi.getWithUserLevels(userId);
      return data;
    },
    enabled: !!userId,
  });
};

export const useSkillById = (id: number) => {
  return useQuery({
    queryKey: skillKeys.detail(id),
    queryFn: async () => {
      const { data } = await skillApi.getById(id);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSkillInput) => {
      const { data: skill } = await skillApi.create(data);
      return skill;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: skillKeys.all });
    },
  });
};

export const useUpdateSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateSkillInput;
    }) => {
      const { data: skill } = await skillApi.update(id, data);
      return skill;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: skillKeys.all });
    },
  });
};

export const useDeleteSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await skillApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: skillKeys.all });
    },
  });
};

export const useUpdateSkillOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      displayOrder,
    }: {
      id: number;
      displayOrder: number;
    }) => {
      const { data } = await skillApi.updateOrder(id, displayOrder);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: skillKeys.all });
    },
  });
};
