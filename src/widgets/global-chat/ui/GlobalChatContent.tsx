"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Bot, User, Users, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";
import { useGlobalChatStore } from "@/features/global-chat/model/globalChatStore";
import { useRoomParticipants } from "@/features/global-chat/model/useGlobalChat";
import { globalChatApi, ChatMessage } from "@/features/global-chat/api/globalChatApi";
import { useUserStore } from "@/entities/user/model/store";
import { useChatSocket } from "@/shared/lib/socket";
import { useQuery } from "@tanstack/react-query";

export const GlobalChatContent = () => {
  const selectedRoomId = useGlobalChatStore((s) => s.selectedRoomId);

  if (!selectedRoomId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-400 bg-white dark:bg-zinc-950">
        <MessageSquare className="h-16 w-16 mb-4" />
        <p className="text-lg">채팅방을 선택하세요</p>
        <p className="text-sm mt-1">왼쪽에서 채팅방을 선택하면 대화를 시작할 수 있습니다</p>
      </div>
    );
  }

  return <ChatRoomContent roomId={selectedRoomId} />;
};

interface ChatRoomContentProps {
  roomId: number;
}

const ChatRoomContent = ({ roomId }: ChatRoomContentProps) => {
  const user = useUserStore((s) => s.user);

  // 채팅방 정보 조회
  const { data: room } = useQuery({
    queryKey: ["chat-room", roomId],
    queryFn: async () => {
      const response = await globalChatApi.getGlobalRooms();
      return response.find((r) => r.id === roomId);
    },
    enabled: roomId > 0,
  });

  const { data: participants, refetch: refetchParticipants } =
    useRoomParticipants(roomId);

  // WebSocket 연결 + 메시지 구독
  const {
    isConnected,
    messages,
    participantsVersion,
    sendMessage: sendSocketMessage,
    clearAllMessages,
  } = useChatSocket(roomId, user?.userId || null);

  // 참여자 변경 시 목록 다시 불러오기
  useEffect(() => {
    if (participantsVersion > 0) {
      refetchParticipants();
    }
  }, [participantsVersion, refetchParticipants]);

  const [inputValue, setInputValue] = useState("");
  const [showParticipants, setShowParticipants] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 메시지가 업데이트되면 스크롤 아래로
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !user) return;

    const content = inputValue.trim();
    setInputValue("");

    if (isConnected) {
      sendSocketMessage(content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 메시지를 시간순으로 정렬 (오래된 것이 위)
  const sortedMessages = messages
    ? [...messages].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
    : [];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
      {/* 채팅방 헤더 */}
      <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          {room?.roomType === "AI_ENABLED" ? (
            <Bot className="h-5 w-5 text-purple-500" />
          ) : (
            <MessageSquare className="h-5 w-5 text-blue-500" />
          )}
          <span className="font-medium">{room?.name || "채팅방"}</span>
          {room?.roomType === "AI_ENABLED" && (
            <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
              AI
            </span>
          )}
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              isConnected
                ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500",
            )}
          >
            {isConnected ? "실시간" : "오프라인"}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {user?.email}
          </span>
          {/* 메시지 삭제 버튼 */}
          <button
            onClick={() => {
              if (confirm("모든 메시지를 삭제하시겠습니까?")) {
                clearAllMessages();
              }
            }}
            className={cn(
              "ml-auto p-1.5 rounded-md text-zinc-500",
              "hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-red-500",
              "transition-colors",
            )}
            title="메시지 전체 삭제"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          {/* 참여자 버튼 */}
          <div className="relative">
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md text-sm",
                "hover:bg-zinc-200 dark:hover:bg-zinc-700",
                "transition-colors",
                showParticipants && "bg-zinc-200 dark:bg-zinc-700",
              )}
            >
              <Users className="h-4 w-4" />
              <span>{participants?.length || 0}</span>
            </button>
            {/* 참여자 드롭다운 */}
            {showParticipants && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-50">
                <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-700">
                  <span className="text-sm font-medium">
                    참여자 ({participants?.length || 0})
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {participants && participants.length > 0 ? (
                    participants.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      >
                        <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-600 flex items-center justify-center overflow-hidden">
                          {p.user?.profileImage ? (
                            <img
                              src={p.user.profileImage}
                              alt={p.user.name || ""}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-4 w-4 text-zinc-500" />
                          )}
                        </div>
                        <span className="text-sm truncate">
                          {p.user?.name || "알 수 없음"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-sm text-zinc-400 text-center">
                      참여자가 없습니다
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        {room?.description && (
          <p className="text-xs text-zinc-500 mt-1">{room.description}</p>
        )}
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sortedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400">
            <MessageSquare className="h-12 w-12 mb-2" />
            <p>아직 메시지가 없습니다</p>
            <p className="text-sm">첫 번째 메시지를 보내보세요!</p>
          </div>
        ) : (
          sortedMessages.map((message) => (
            <ChatMessageItem
              key={message.id}
              message={message}
              isOwn={message.userId === user?.userId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!inputValue.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

interface ChatMessageItemProps {
  message: ChatMessage;
  isOwn: boolean;
}

const ChatMessageItem = ({ message, isOwn }: ChatMessageItemProps) => {
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 시스템 메시지
  if (message.messageType === "SYSTEM") {
    return (
      <div className="flex justify-center">
        <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  // AI 메시지
  if (message.messageType === "AI") {
    return (
      <div className="flex gap-2">
        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
          <Bot className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex flex-col max-w-[70%]">
          <span className="text-xs text-zinc-500 mb-1">AI 어시스턴트</span>
          <div className="px-3 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-zinc-800 dark:text-zinc-200">
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
          <span className="text-xs text-zinc-400 mt-1">
            {formatTime(message.createdAt)}
          </span>
        </div>
      </div>
    );
  }

  // 일반 채팅 메시지
  return (
    <div className={cn("flex gap-2", isOwn && "flex-row-reverse")}>
      {!isOwn && (
        <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0 overflow-hidden">
          {message.user?.profileImage ? (
            <img
              src={message.user.profileImage}
              alt={message.user.name || ""}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="h-4 w-4 text-zinc-500" />
          )}
        </div>
      )}
      <div className={cn("flex flex-col max-w-[70%]", isOwn && "items-end")}>
        {!isOwn && (
          <span className="text-xs text-zinc-500 mb-1">
            {message.user?.name || "알 수 없음"}
          </span>
        )}
        <div
          className={cn(
            "px-3 py-2 rounded-lg",
            isOwn
              ? "bg-blue-500 text-white"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200",
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <span className="text-xs text-zinc-400 mt-1">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
};
