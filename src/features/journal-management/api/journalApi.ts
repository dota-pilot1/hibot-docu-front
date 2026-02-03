import { api } from "@/shared/api";

// Types
export type JournalType = "DEV" | "STUDY";

export interface JournalCategory {
  id: number;
  userId: number;
  name: string;
  journalType: JournalType;
  description?: string;
  parentId?: number | null;
  displayOrder: number;
  depth: number;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  children?: JournalCategory[];
}

export interface Journal {
  id: number;
  categoryId: number;
  userId: number;
  title: string;
  content?: string;
  journalDate: string;
  tags: string[];
  metadata: Record<string, any>;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJournalCategoryRequest {
  name: string;
  journalType: JournalType;
  description?: string;
  parentId?: number;
  icon?: string;
}

export interface UpdateJournalCategoryRequest {
  name?: string;
  journalType?: JournalType;
  description?: string;
  parentId?: number;
  icon?: string;
}

export interface CreateJournalRequest {
  categoryId: number;
  title: string;
  content?: string;
  journalDate?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateJournalRequest {
  categoryId?: number;
  title?: string;
  content?: string;
  journalDate?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface TeamWithJournals extends JournalCategory {
  journals: Journal[];
}

export const journalApi = {
  // Category endpoints
  getTree: async (type?: JournalType): Promise<JournalCategory[]> => {
    const { data } = await api.get("/journals/categories/tree", {
      params: type ? { type } : undefined,
    });
    return data;
  },

  getTeamsWithJournals: async (
    type?: JournalType,
  ): Promise<TeamWithJournals[]> => {
    const { data } = await api.get("/journals/teams-with-journals", {
      params: type ? { type } : undefined,
    });
    return data;
  },

  createCategory: async (
    dto: CreateJournalCategoryRequest,
  ): Promise<JournalCategory> => {
    const { data } = await api.post("/journals/categories", dto);
    return data;
  },

  updateCategory: async (
    id: number,
    dto: UpdateJournalCategoryRequest,
  ): Promise<JournalCategory> => {
    const { data } = await api.patch(`/journals/categories/${id}`, dto);
    return data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/journals/categories/${id}`);
  },

  reorderCategories: async (
    categoryIds: number[],
    parentId: number | null,
  ): Promise<void> => {
    await api.patch("/journals/categories/reorder", { categoryIds, parentId });
  },

  // Journal endpoints
  getJournals: async (categoryId?: number): Promise<Journal[]> => {
    const { data } = await api.get("/journals", {
      params: categoryId ? { categoryId } : undefined,
    });
    return data;
  },

  getJournalById: async (id: number): Promise<Journal> => {
    const { data } = await api.get(`/journals/${id}`);
    return data;
  },

  createJournal: async (dto: CreateJournalRequest): Promise<Journal> => {
    const { data } = await api.post("/journals", dto);
    return data;
  },

  updateJournal: async (
    id: number,
    dto: UpdateJournalRequest,
  ): Promise<Journal> => {
    const { data } = await api.patch(`/journals/${id}`, dto);
    return data;
  },

  deleteJournal: async (id: number): Promise<void> => {
    await api.delete(`/journals/${id}`);
  },

  reorderJournals: async (
    categoryId: number,
    journalIds: number[],
  ): Promise<void> => {
    await api.patch("/journals/reorder", { categoryId, journalIds });
  },
};
