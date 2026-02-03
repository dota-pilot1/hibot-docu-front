import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { skillApi } from '../api/skillApi';
import type {
  CreateSkillCategoryInput,
  UpdateSkillCategoryInput,
  CreateSkillInput,
  UpdateSkillInput,
} from '../model/types';

// Query Keys
export const skillKeys = {
  all: ['skills'] as const,
  categories: () => [...skillKeys.all, 'categories'] as const,
  category: (id: number) => [...skillKeys.categories(), id] as const,
  list: () => [...skillKeys.all, 'list'] as const,
  tree: () => [...skillKeys.all, 'tree'] as const,
  treeWithUser: (userId: number) => [...skillKeys.tree(), 'user', userId] as const,
  byCategory: (categoryId: number) => [...skillKeys.all, 'category', categoryId] as const,
  detail: (id: number) => [...skillKeys.all, 'detail', id] as const,
};

// ============================================
// Skill Categories Hooks
// ============================================

export const useSkillCategories = () => {
  return useQuery({
    queryKey: skillKeys.categories(),
    queryFn: async () => {
      const { data } = await skillApi.getCategories();
      return data;
    },
  });
};

export const useCreateSkillCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSkillCategoryInput) => {
      const { data: category } = await skillApi.createCategory(data);
      return category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: skillKeys.categories() });
      queryClient.invalidateQueries({ queryKey: skillKeys.tree() });
    },
  });
};

export const useUpdateSkillCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateSkillCategoryInput }) => {
      const { data: category } = await skillApi.updateCategory(id, data);
      return category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: skillKeys.categories() });
      queryClient.invalidateQueries({ queryKey: skillKeys.tree() });
    },
  });
};

export const useDeleteSkillCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await skillApi.deleteCategory(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: skillKeys.categories() });
      queryClient.invalidateQueries({ queryKey: skillKeys.tree() });
    },
  });
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

export const useSkillTree = () => {
  return useQuery({
    queryKey: skillKeys.tree(),
    queryFn: async () => {
      const { data } = await skillApi.getTree();
      return data;
    },
  });
};

export const useSkillTreeWithUserLevels = (userId: number) => {
  return useQuery({
    queryKey: skillKeys.treeWithUser(userId),
    queryFn: async () => {
      const { data } = await skillApi.getTreeWithUserLevels(userId);
      return data;
    },
    enabled: !!userId,
  });
};

export const useSkillsByCategory = (categoryId: number) => {
  return useQuery({
    queryKey: skillKeys.byCategory(categoryId),
    queryFn: async () => {
      const { data } = await skillApi.getByCategory(categoryId);
      return data;
    },
    enabled: !!categoryId,
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
    mutationFn: async ({ id, data }: { id: number; data: UpdateSkillInput }) => {
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
    mutationFn: async ({ id, displayOrder }: { id: number; displayOrder: number }) => {
      const { data } = await skillApi.updateOrder(id, displayOrder);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: skillKeys.all });
    },
  });
};
