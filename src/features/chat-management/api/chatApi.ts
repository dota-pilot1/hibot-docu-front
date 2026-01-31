import { api } from "@/shared/api";

export interface ChatTeam {
  id: number;
  name: string;
  description: string | null;
  projectId: number | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatProject {
  id: number;
  name: string;
  description: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  teams: ChatTeam[];
}

export const chatApi = {
  // 프로젝트 + 팀 목록 조회
  getProjectsWithTeams: async (): Promise<ChatProject[]> => {
    const response = await api.get("/chat-projects/with-teams");
    return response.data;
  },

  // 프로젝트 생성
  createProject: async (data: {
    name: string;
    description?: string;
  }): Promise<ChatProject> => {
    const response = await api.post("/chat-projects", data);
    return response.data;
  },

  // 프로젝트 수정
  updateProject: async (
    id: number,
    data: { name?: string; description?: string },
  ): Promise<ChatProject> => {
    const response = await api.patch(`/chat-projects/${id}`, data);
    return response.data;
  },

  // 프로젝트 삭제
  deleteProject: async (id: number): Promise<void> => {
    await api.delete(`/chat-projects/${id}`);
  },

  // 팀 상세 조회
  getTeam: async (id: number): Promise<ChatTeam> => {
    const response = await api.get(`/chat-teams/${id}`);
    return response.data;
  },

  // 팀 생성
  createTeam: async (data: {
    name: string;
    description?: string;
    projectId?: number;
  }): Promise<ChatTeam> => {
    const response = await api.post("/chat-teams", data);
    return response.data;
  },

  // 팀 수정
  updateTeam: async (
    id: number,
    data: { name?: string; description?: string },
  ): Promise<ChatTeam> => {
    const response = await api.patch(`/chat-teams/${id}`, data);
    return response.data;
  },

  // 팀 삭제
  deleteTeam: async (id: number): Promise<void> => {
    await api.delete(`/chat-teams/${id}`);
  },

  // 팀 프로젝트 이동
  moveTeam: async (id: number, projectId: number | null): Promise<ChatTeam> => {
    const response = await api.patch(`/chat-teams/${id}/move`, { projectId });
    return response.data;
  },
};
