import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  globalChatApi,
  GlobalChatRoom,
  ChatMessage,
  ChatParticipant,
} from "../api/globalChatApi";

// 전체 채팅방 목록 조회
export const useGlobalRooms = () => {
  return useQuery<GlobalChatRoom[]>({
    queryKey: ["global-chat-rooms"],
    queryFn: globalChatApi.getGlobalRooms,
    staleTime: 1000 * 60 * 5,
  });
};

// 전체 채팅방 생성
export const useCreateGlobalRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: globalChatApi.createGlobalRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global-chat-rooms"] });
    },
  });
};

// 채팅방 수정
export const useUpdateGlobalRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { name?: string; description?: string };
    }) => globalChatApi.updateRoom(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global-chat-rooms"] });
    },
  });
};

// 채팅방 삭제
export const useDeleteGlobalRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: globalChatApi.deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global-chat-rooms"] });
    },
  });
};

// 채팅방 메시지 조회
export const useRoomMessages = (roomId: number | null) => {
  return useQuery<ChatMessage[]>({
    queryKey: ["chat-messages", roomId],
    queryFn: () => globalChatApi.getMessages(roomId!, 100),
    enabled: roomId !== null && roomId > 0,
    staleTime: 1000 * 30,
  });
};

// 채팅방 참여자 조회
export const useRoomParticipants = (roomId: number | null) => {
  return useQuery<ChatParticipant[]>({
    queryKey: ["chat-participants", roomId],
    queryFn: () => globalChatApi.getParticipants(roomId!),
    enabled: roomId !== null && roomId > 0,
    staleTime: 1000 * 60,
  });
};

// 메시지 전체 삭제
export const useClearMessages = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: globalChatApi.clearMessages,
    onSuccess: (_, roomId) => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", roomId] });
    },
  });
};
