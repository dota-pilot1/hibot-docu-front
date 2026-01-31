"use client";

import { useEffect, useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { chatSocket } from "./chatSocket";
import { ChatMessage } from "@/features/chat-management";

export const useChatSocket = (roomId: number | null, userId: number | null) => {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  // 소켓 연결 및 방 입장
  useEffect(() => {
    if (!userId) return;

    chatSocket.connect(userId);
    setIsConnected(chatSocket.isConnected());

    // 연결 상태 체크
    const checkConnection = setInterval(() => {
      setIsConnected(chatSocket.isConnected());
    }, 1000);

    return () => {
      clearInterval(checkConnection);
    };
  }, [userId]);

  // 방 입장/퇴장
  useEffect(() => {
    if (!roomId || !userId) return;

    chatSocket.joinRoom(roomId);

    return () => {
      chatSocket.leaveRoom(roomId);
    };
  }, [roomId, userId]);

  // 새 메시지 수신 처리
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = chatSocket.onMessage(
      roomId,
      (newMessage: ChatMessage) => {
        // React Query 캐시 업데이트
        queryClient.setQueryData<ChatMessage[]>(
          ["chats", "messages", roomId, 50],
          (oldMessages) => {
            if (!oldMessages) return [newMessage];
            // 중복 체크
            if (oldMessages.some((m) => m.id === newMessage.id)) {
              return oldMessages;
            }
            return [...oldMessages, newMessage];
          },
        );
      },
    );

    return () => {
      unsubscribe();
    };
  }, [roomId, queryClient]);

  // 메시지 전송 함수 - WebSocket으로 전송, 서버가 newMessage로 브로드캐스트
  const sendMessage = useCallback(
    (content: string): boolean => {
      if (!roomId) return false;
      return chatSocket.sendMessage(roomId, content);
    },
    [roomId],
  );

  return {
    isConnected,
    sendMessage,
  };
};
