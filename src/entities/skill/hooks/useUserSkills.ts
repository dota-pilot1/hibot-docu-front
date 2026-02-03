import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { skillApi } from "../api/skillApi";
import type { UpdateUserSkillInput } from "../model/types";
import { skillKeys } from "./useSkills";

// Query Keys
export const userSkillKeys = {
  all: ["userSkills"] as const,
  byUser: (userId: number) => [...userSkillKeys.all, userId] as const,
  activities: (userId: number) =>
    [...userSkillKeys.all, "activities", userId] as const,
  departmentSummary: (departmentId: number) =>
    [...userSkillKeys.all, "department", departmentId] as const,
};

// ============================================
// User Skills Hooks
// ============================================

export const useUserSkills = (userId: number) => {
  return useQuery({
    queryKey: userSkillKeys.byUser(userId),
    queryFn: async () => {
      const { data } = await skillApi.getUserSkills(userId);
      return data;
    },
    enabled: !!userId,
  });
};

export const useUpdateUserSkill = (userId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      skillId,
      data,
    }: {
      skillId: number;
      data: UpdateUserSkillInput;
    }) => {
      const { data: userSkill } = await skillApi.updateUserSkill(
        userId,
        skillId,
        data,
      );
      return userSkill;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userSkillKeys.byUser(userId) });
      queryClient.invalidateQueries({
        queryKey: userSkillKeys.activities(userId),
      });
      queryClient.invalidateQueries({
        queryKey: skillKeys.withUserLevels(userId),
      });
    },
  });
};

export const useUserSkillActivities = (userId: number) => {
  return useQuery({
    queryKey: userSkillKeys.activities(userId),
    queryFn: async () => {
      const { data } = await skillApi.getUserActivities(userId);
      return data;
    },
    enabled: !!userId,
  });
};

// ============================================
// Department Skills Hooks
// ============================================

export const useDepartmentSkillsSummary = (departmentId: number) => {
  return useQuery({
    queryKey: userSkillKeys.departmentSummary(departmentId),
    queryFn: async () => {
      const { data } = await skillApi.getDepartmentSummary(departmentId);
      return data;
    },
    enabled: !!departmentId,
  });
};
