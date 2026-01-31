import { api } from "@/shared/api";

export interface ChatRoom {
  id: number;
  teamId: number;
  name: string;
  description: string | null;
  roomType: "GENERAL" | "AI_ENABLED";
  maxParticipants: number;
  createdBy: number | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageUser {
  id: number;
  name: string | null;
  profileImage: string | null;
}

export interface ChatMessage {
  id: number;
  roomId: number;
  userId: number;
  messageType: "CHAT" | "SYSTEM" | "AI";
  content: string;
  createdAt: string;
  user: ChatMessageUser | null;
}

export interface ChatParticipant {
  id: number;
  roomId: number;
  userId: number;
  joinedAt: string;
  lastReadAt: string | null;
  isActive: boolean;
  user: ChatMessageUser | null;
}

export interface ChatTeam {
  id: number;
  name: string;
  description: string | null;
  projectId: number | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  rooms?: ChatRoom[];
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

  // === 채팅방 API ===

  // 팀별 채팅방 목록 조회
  getRoomsByTeam: async (teamId: number): Promise<ChatRoom[]> => {
    const response = await api.get(`/chat-rooms?teamId=${teamId}`);
    return response.data;
  },

  // 채팅방 상세 조회
  getRoom: async (id: number): Promise<ChatRoom> => {
    const response = await api.get(`/chat-rooms/${id}`);
    return response.data;
  },

  // 채팅방 생성
  createRoom: async (data: {
    teamId: number;
    name: string;
    description?: string;
    roomType?: "GENERAL" | "AI_ENABLED";
    createdBy?: number;
  }): Promise<ChatRoom> => {
    const response = await api.post("/chat-rooms", data);
    return response.data;
  },

  // 채팅방 수정
  updateRoom: async (
    id: number,
    data: {
      name?: string;
      description?: string;
      roomType?: "GENERAL" | "AI_ENABLED";
    },
  ): Promise<ChatRoom> => {
    const response = await api.patch(`/chat-rooms/${id}`, data);
    return response.data;
  },

  // 채팅방 삭제
  deleteRoom: async (id: number): Promise<void> => {
    await api.delete(`/chat-rooms/${id}`);
  },

  // 채팅방 팀 이동
  moveRoom: async (id: number, teamId: number): Promise<ChatRoom> => {
    const response = await api.patch(`/chat-rooms/${id}/move`, { teamId });
    return response.data;
  },

  // === 메시지 API ===

  // 채팅방 메시지 목록 조회
  getMessages: async (
    roomId: number,
    limit = 50,
    offset = 0,
  ): Promise<ChatMessage[]> => {
    const response = await api.get(
      `/chat-rooms/${roomId}/messages?limit=${limit}&offset=${offset}`,
    );
    return response.data;
  },

  // 메시지 전송
  sendMessage: async (
    roomId: number,
    data: {
      userId: number;
      content: string;
      messageType?: "CHAT" | "SYSTEM" | "AI";
    },
  ): Promise<ChatMessage> => {
    const response = await api.post(`/chat-rooms/${roomId}/messages`, data);
    return response.data;
  },

  // === 참여자 API ===

  // 채팅방 참여자 목록 조회
  getParticipants: async (roomId: number): Promise<ChatParticipant[]> => {
    const response = await api.get(`/chat-rooms/${roomId}/participants`);
    return response.data;
  },

  // 참여자 추가
  addParticipant: async (
    roomId: number,
    userId: number,
  ): Promise<ChatParticipant> => {
    const response = await api.post(`/chat-rooms/${roomId}/participants`, {
      userId,
    });
    return response.data;
  },

  // 참여자 제거
  removeParticipant: async (roomId: number, userId: number): Promise<void> => {
    await api.delete(`/chat-rooms/${roomId}/participants/${userId}`);
  },

  // 메시지 전체 삭제
  clearMessages: async (roomId: number): Promise<void> => {
    await api.delete(`/chat-rooms/${roomId}/messages`);
  },
};
