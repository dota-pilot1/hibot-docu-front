import { api } from "@/shared/api";

export interface GlobalChatRoom {
  id: number;
  teamId: null; // 전체 채팅방은 teamId가 null
  name: string;
  description: string | null;
  roomType: "GENERAL" | "AI_ENABLED";
  maxParticipants: number;
  createdBy: number | null;
  displayOrder: number;
  isActive: boolean;
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

export const globalChatApi = {
  // 전체 채팅방 목록 조회
  getGlobalRooms: async (): Promise<GlobalChatRoom[]> => {
    const response = await api.get("/chat-rooms/global");
    return response.data;
  },

  // 전체 채팅방 생성
  createGlobalRoom: async (data: {
    name: string;
    description?: string;
    roomType?: "GENERAL" | "AI_ENABLED";
    createdBy?: number;
  }): Promise<GlobalChatRoom> => {
    const response = await api.post("/chat-rooms", {
      ...data,
      teamId: undefined, // teamId 없으면 전체 채팅방
    });
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
  ): Promise<GlobalChatRoom> => {
    const response = await api.patch(`/chat-rooms/${id}`, data);
    return response.data;
  },

  // 채팅방 삭제
  deleteRoom: async (id: number): Promise<void> => {
    await api.delete(`/chat-rooms/${id}`);
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

  // === 참여자 API ===

  // 채팅방 참여자 목록 조회
  getParticipants: async (roomId: number): Promise<ChatParticipant[]> => {
    const response = await api.get(`/chat-rooms/${roomId}/participants`);
    return response.data;
  },

  // 메시지 전체 삭제
  clearMessages: async (roomId: number): Promise<void> => {
    await api.delete(`/chat-rooms/${roomId}/messages`);
  },
};
