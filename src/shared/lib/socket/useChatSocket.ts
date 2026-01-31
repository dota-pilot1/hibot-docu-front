"use client";

import { useEffect, useCallback, useState } from "react";
import { useStore } from "@tanstack/react-store";
import { chatSocket } from "./chatSocket";
import { chatStore, setMessages } from "./chatStore";
import { chatApi, ChatMessage } from "@/features/chat-management";

export const useChatSocket = (roomId: number | null, userId: number | null) => {
  const [isConnected, setIsConnected] = useState(false);

  // Store에서 메시지 구독
  const messages = useStore(chatStore, (state) =>
    roomId ? state.messages.get(roomId) || [] : [],
  );

  // 참여자 버전 구독 (변경 시 re-fetch 트리거)
  const participantsVersion = useStore(chatStore, (state) =>
    roomId ? state.participantsVersion.get(roomId) || 0 : 0,
  );

  // 소켓 연결
  useEffect(() => {
    if (!userId) return;

    chatSocket.connect(userId);
    setIsConnected(chatSocket.isConnected());

    const checkConnection = setInterval(() => {
      setIsConnected(chatSocket.isConnected());
    }, 1000);

    return () => {
      clearInterval(checkConnection);
    };
  }, [userId]);

  // 방 입장/퇴장 + 초기 메시지 로딩
  useEffect(() => {
    if (!roomId || !userId) return;

    let isMounted = true;

    chatSocket.joinRoom(roomId);

    // 초기 메시지 로딩 (REST API → Store)
    console.log("Loading messages for room:", roomId);
    chatApi
      .getMessages(roomId, 50)
      .then((msgs) => {
        if (isMounted) {
          console.log("Loaded messages:", msgs.length, msgs);
          setMessages(roomId, msgs);
        }
      })
      .catch((err) => {
        console.error("Failed to load messages:", err);
      });

    return () => {
      isMounted = false;
      // cleanup에서 leaveRoom 호출하지 않음
      // React Strict Mode에서 joinRoom 후에 leaveRoom이 호출되는 문제 방지
      // 실제 방 나가기는 disconnect 시 서버에서 처리
    };
  }, [roomId, userId]);

  // 메시지 전송
  const sendMessage = useCallback(
    (content: string): boolean => {
      if (!roomId) return false;
      return chatSocket.sendMessage(roomId, content);
    },
    [roomId],
  );

  // 메시지 전체 삭제
  const clearAllMessages = useCallback((): boolean => {
    if (!roomId) return false;
    return chatSocket.clearMessages(roomId);
  }, [roomId]);

  return {
    isConnected,
    messages,
    participantsVersion,
    sendMessage,
    clearAllMessages,
  };
};
