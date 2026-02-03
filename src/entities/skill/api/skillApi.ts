import { api } from "@/shared/api";
import type {
  Skill,
  SkillCategory,
  UserSkill,
  SkillActivity,
  SkillWithUserLevel,
  DepartmentSkillSummary,
  CreateSkillCategoryInput,
  UpdateSkillCategoryInput,
  CreateSkillInput,
  UpdateSkillInput,
  UpdateUserSkillInput,
} from "../model/types";

export const skillApi = {
  // ============================================
  // Skill Categories
  // ============================================

  getAllCategories: () => api.get<SkillCategory[]>("/skills/categories"),

  getCategoryById: (id: number) =>
    api.get<SkillCategory>(`/skills/categories/${id}`),

  createCategory: (data: CreateSkillCategoryInput) =>
    api.post<SkillCategory>("/skills/categories", data),

  updateCategory: (id: number, data: UpdateSkillCategoryInput) =>
    api.patch<SkillCategory>(`/skills/categories/${id}`, data),

  deleteCategory: (id: number) =>
    api.delete<SkillCategory>(`/skills/categories/${id}`),

  // ============================================
  // Skills
  // ============================================

  getAll: () => api.get<Skill[]>("/skills"),

  getWithUserLevels: (userId: number) =>
    api.get<SkillWithUserLevel[]>(`/skills/with-user-levels/${userId}`),

  getById: (id: number) => api.get<Skill>(`/skills/${id}`),

  create: (data: CreateSkillInput) => api.post<Skill>("/skills", data),

  update: (id: number, data: UpdateSkillInput) =>
    api.patch<Skill>(`/skills/${id}`, data),

  delete: (id: number) => api.delete<Skill>(`/skills/${id}`),

  updateOrder: (id: number, displayOrder: number) =>
    api.patch<Skill>(`/skills/${id}/order`, { displayOrder }),

  // ============================================
  // User Skills
  // ============================================

  getUserSkills: (userId: number) =>
    api.get<UserSkill[]>(`/skills/user/${userId}`),

  updateUserSkill: (
    userId: number,
    skillId: number,
    data: UpdateUserSkillInput,
  ) => api.patch<UserSkill>(`/skills/user/${userId}/skill/${skillId}`, data),

  getUserActivities: (userId: number) =>
    api.get<SkillActivity[]>(`/skills/user/${userId}/activities`),

  // ============================================
  // Department Skills
  // ============================================

  getDepartmentSummary: (departmentId: number) =>
    api.get<DepartmentSkillSummary[]>(
      `/skills/department/${departmentId}/summary`,
    ),
};
