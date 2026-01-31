import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  chatApi,
  ChatProject,
  ChatTeam,
  ChatRoom,
  ChatMessage,
  ChatParticipant,
} from "../api/chatApi";

// 프로젝트 + 팀 목록 조회
export const useProjectsWithTeams = () => {
  return useQuery<ChatProject[]>({
    queryKey: ["chats", "projects"],
    queryFn: chatApi.getProjectsWithTeams,
    staleTime: 1000 * 60 * 5,
  });
};

// 팀 상세 조회
export const useTeam = (id: number | null) => {
  return useQuery<ChatTeam>({
    queryKey: ["chats", "team", id],
    queryFn: () => chatApi.getTeam(id!),
    enabled: id !== null,
    staleTime: 1000 * 60 * 5,
  });
};

// 프로젝트 생성
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats", "projects"] });
    },
  });
};

// 프로젝트 수정
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { name?: string; description?: string };
    }) => chatApi.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats", "projects"] });
    },
  });
};

// 프로젝트 삭제
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats", "projects"] });
    },
  });
};

// 팀 생성
export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats", "projects"] });
    },
  });
};

// 팀 수정
export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { name?: string; description?: string };
    }) => chatApi.updateTeam(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chats", "projects"] });
      queryClient.invalidateQueries({
        queryKey: ["chats", "team", variables.id],
      });
    },
  });
};

// 팀 삭제
export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats", "projects"] });
    },
  });
};

// 팀 프로젝트 이동
export const useMoveTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, projectId }: { id: number; projectId: number | null }) =>
      chatApi.moveTeam(id, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats", "projects"] });
    },
  });
};

// === 채팅방 훅 ===

// 팀별 채팅방 목록 조회
export const useRoomsByTeam = (teamId: number | null) => {
  return useQuery<ChatRoom[]>({
    queryKey: ["chats", "rooms", teamId],
    queryFn: () => chatApi.getRoomsByTeam(teamId!),
    enabled: teamId !== null,
    staleTime: 1000 * 60 * 5,
  });
};

// 채팅방 상세 조회
export const useRoom = (id: number | null) => {
  return useQuery<ChatRoom>({
    queryKey: ["chats", "room", id],
    queryFn: () => chatApi.getRoom(id!),
    enabled: id !== null,
    staleTime: 1000 * 60 * 5,
  });
};

// 채팅방 생성
export const useCreateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.createRoom,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chats", "rooms", variables.teamId],
      });
    },
  });
};

// 채팅방 수정
export const useUpdateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        name?: string;
        description?: string;
        roomType?: "GENERAL" | "AI_ENABLED";
      };
    }) => chatApi.updateRoom(id, data),
    onSuccess: (room) => {
      queryClient.invalidateQueries({
        queryKey: ["chats", "rooms", room.teamId],
      });
      queryClient.invalidateQueries({ queryKey: ["chats", "room", room.id] });
    },
  });
};

// 채팅방 삭제
export const useDeleteRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats", "rooms"] });
    },
  });
};

// 채팅방 팀 이동
export const useMoveRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, teamId }: { id: number; teamId: number }) =>
      chatApi.moveRoom(id, teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats", "rooms"] });
    },
  });
};

// === 메시지 훅 ===

// 채팅방 메시지 목록 조회
export const useMessages = (roomId: number | null, limit = 50) => {
  return useQuery<ChatMessage[]>({
    queryKey: ["chats", "messages", roomId, limit],
    queryFn: () => chatApi.getMessages(roomId!, limit),
    enabled: roomId !== null,
    staleTime: 0, // 항상 최신 데이터 가져오기
  });
};

// 메시지 전송
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roomId,
      userId,
      content,
    }: {
      roomId: number;
      userId: number;
      content: string;
    }) => chatApi.sendMessage(roomId, { userId, content }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chats", "messages", variables.roomId],
      });
    },
  });
};

// === 참여자 훅 ===

// 채팅방 참여자 목록 조회
export const useParticipants = (roomId: number | null) => {
  return useQuery<ChatParticipant[]>({
    queryKey: ["chats", "participants", roomId],
    queryFn: () => chatApi.getParticipants(roomId!),
    enabled: roomId !== null,
    staleTime: 1000 * 60, // 1분
  });
};

// 참여자 추가
export const useAddParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, userId }: { roomId: number; userId: number }) =>
      chatApi.addParticipant(roomId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chats", "participants", variables.roomId],
      });
    },
  });
};

// 참여자 제거
export const useRemoveParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, userId }: { roomId: number; userId: number }) =>
      chatApi.removeParticipant(roomId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chats", "participants", variables.roomId],
      });
    },
  });
};

// 메시지 전체 삭제
export const useClearMessages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: number) => chatApi.clearMessages(roomId),
    onSuccess: (_, roomId) => {
      queryClient.setQueryData(["chats", "messages", roomId, 50], []);
    },
  });
};
