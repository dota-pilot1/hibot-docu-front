"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MessageSquare, Send, Bot, User, Users, Trash2 } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
  pointerWithin,
  useDroppable,
} from "@dnd-kit/core";
import {
  useChatStore,
  chatStore,
  ChatTab,
  ChatPanel,
} from "@/widgets/chat-sidebar";
import { ChatTabBar } from "./ChatTabBar";
import { cn } from "@/shared/lib/utils";
import {
  useRoom,
  useMessages,
  useSendMessage,
  useParticipants,
  useClearMessages,
  ChatMessage,
} from "@/features/chat-management";
import { useUserStore } from "@/entities/user/model/store";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useChatSocket } from "@/shared/lib/socket";

const MIN_PANEL_WIDTH = 0.15;

export const ChatMainContent = () => {
  const [mounted, setMounted] = useState(false);
  const panels = useChatStore((s) => s.panels);
  const setActivePanel = useChatStore((s) => s.setActivePanel);
  const setPanelWidths = useChatStore((s) => s.setPanelWidths);
  const reorderTabs = useChatStore((s) => s.reorderTabs);
  const moveTabToPanel = useChatStore((s) => s.moveTabToPanel);
  const addPanelWithTab = useChatStore((s) => s.addPanelWithTab);

  const containerRef = useRef<HTMLDivElement>(null);
  const [resizing, setResizing] = useState<{
    handleIndex: number;
    startX: number;
    leftPanelStartWidth: number;
    rightPanelStartWidth: number;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<ChatTab | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const findPanelByTabId = useCallback(
    (tabId: number) => {
      return panels.find((p) => p.tabs.some((t) => t.id === tabId));
    },
    [panels],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      // active.id가 'chat-tab-{panelId}-{tabId}' 형식이므로 tabId 추출
      const activeIdStr = String(active.id);
      const tabId = activeIdStr.startsWith("chat-tab-")
        ? parseInt(activeIdStr.split("-").pop() || "0", 10)
        : (active.id as number);
      const panel = findPanelByTabId(tabId);
      if (panel) {
        const tab = panel.tabs.find((t) => t.id === tabId);
        if (tab) {
          setActiveTab(tab);
        }
      }
    },
    [findPanelByTabId],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTab(null);

      if (!over) return;

      // active.id가 'chat-tab-{panelId}-{tabId}' 형식이므로 tabId 추출
      const activeIdStr = String(active.id);
      const activeTabId = activeIdStr.startsWith("chat-tab-")
        ? parseInt(activeIdStr.split("-").pop() || "0", 10)
        : (active.id as number);
      const fromPanel = findPanelByTabId(activeTabId);
      if (!fromPanel) return;

      const fromIndex = fromPanel.tabs.findIndex((t) => t.id === activeTabId);

      if (over.data.current?.type === "TAB") {
        const overTabId = over.data.current.tabId as number;
        const toPanel = findPanelByTabId(overTabId);
        if (!toPanel) return;

        const toIndex = toPanel.tabs.findIndex((t) => t.id === overTabId);

        if (fromPanel.id === toPanel.id) {
          if (fromIndex !== toIndex) {
            reorderTabs(fromPanel.id, fromIndex, toIndex);
          }
        } else {
          moveTabToPanel(fromPanel.id, toPanel.id, activeTabId, toIndex);
        }
        return;
      }

      if (over.data.current?.type === "PANEL") {
        const toPanelId = over.id as string;
        if (fromPanel.id !== toPanelId) {
          moveTabToPanel(fromPanel.id, toPanelId, activeTabId);
        }
        return;
      }

      if (over.data.current?.type === "CONTENT") {
        const targetPanelId = over.data.current.panelId as string;
        addPanelWithTab(fromPanel.id, activeTabId, targetPanelId);
      }
    },
    [findPanelByTabId, reorderTabs, moveTabToPanel, addPanelWithTab],
  );

  const collisionDetection = useCallback(
    (args: Parameters<typeof pointerWithin>[0]) => {
      const pointerCollisions = pointerWithin(args);

      const tabCollision = pointerCollisions.find(
        (c) => c.data?.droppableContainer?.data?.current?.type === "TAB",
      );
      if (tabCollision) return [tabCollision];

      const panelCollision = pointerCollisions.find(
        (c) => c.data?.droppableContainer?.data?.current?.type === "PANEL",
      );
      if (panelCollision) return [panelCollision];

      const contentCollision = pointerCollisions.find(
        (c) => c.data?.droppableContainer?.data?.current?.type === "CONTENT",
      );
      if (contentCollision) return [contentCollision];

      return rectIntersection(args);
    },
    [],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, handleIndex: number) => {
      e.preventDefault();
      const leftPanel = panels[handleIndex];
      const rightPanel = panels[handleIndex + 1];

      setResizing({
        handleIndex,
        startX: e.clientX,
        leftPanelStartWidth: leftPanel.width,
        rightPanelStartWidth: rightPanel.width,
      });
    },
    [panels],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!resizing || !containerRef.current) return;

      requestAnimationFrame(() => {
        const containerWidth = containerRef.current?.clientWidth || 1;
        const totalWidth =
          resizing.leftPanelStartWidth + resizing.rightPanelStartWidth;
        const deltaX = e.clientX - resizing.startX;
        const deltaRatio = deltaX / containerWidth;

        let newLeftWidth =
          resizing.leftPanelStartWidth + deltaRatio * totalWidth;
        let newRightWidth =
          resizing.rightPanelStartWidth - deltaRatio * totalWidth;

        if (newLeftWidth < MIN_PANEL_WIDTH * totalWidth) {
          newLeftWidth = MIN_PANEL_WIDTH * totalWidth;
          newRightWidth = totalWidth - newLeftWidth;
        }
        if (newRightWidth < MIN_PANEL_WIDTH * totalWidth) {
          newRightWidth = MIN_PANEL_WIDTH * totalWidth;
          newLeftWidth = totalWidth - newRightWidth;
        }

        const leftPanel = panels[resizing.handleIndex];
        const rightPanel = panels[resizing.handleIndex + 1];

        setPanelWidths(
          leftPanel.id,
          rightPanel.id,
          newLeftWidth,
          newRightWidth,
        );
      });
    },
    [resizing, panels, setPanelWidths],
  );

  const handleMouseUp = useCallback(() => {
    setResizing(null);
  }, []);

  useEffect(() => {
    if (resizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [resizing, handleMouseMove, handleMouseUp]);

  if (!mounted) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
        <div className="flex-1 flex items-center justify-center text-zinc-400">
          <MessageSquare className="h-16 w-16" />
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div ref={containerRef} className="flex h-full">
        {panels.map((panel, index) => (
          <div
            key={panel.id}
            className="flex min-w-0"
            style={{ flex: panel.width }}
          >
            <div
              className="flex-1 flex flex-col min-w-0"
              onClick={() => setActivePanel(panel.id)}
            >
              <ChatTabBar
                panel={panel}
                onPanelClick={() => setActivePanel(panel.id)}
                isDragging={activeTab !== null}
              />
              <ChatTabContent panel={panel} isDragging={activeTab !== null} />
            </div>

            {index < panels.length - 1 && (
              <div
                className={cn(
                  "w-1 shrink-0 cursor-col-resize",
                  "bg-zinc-200 dark:bg-zinc-700",
                  "hover:bg-blue-400 dark:hover:bg-blue-500",
                  resizing?.handleIndex === index &&
                    "bg-blue-400 dark:bg-blue-500",
                  !resizing && "transition-colors",
                )}
                onMouseDown={(e) => handleMouseDown(e, index)}
              />
            )}
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeTab ? <ChatTabDragPreview tab={activeTab} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

interface ChatTabContentProps {
  panel: ChatPanel;
  isDragging: boolean;
}

const ChatTabContent = ({ panel, isDragging }: ChatTabContentProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `chat-content-${panel.id}`,
    data: { type: "CONTENT", panelId: panel.id },
  });

  const activeTabId = panel.activeTabId;
  const activeTab = activeTabId
    ? panel.tabs.find((t) => t.id === activeTabId)
    : null;

  if (!activeTab || !activeTabId) {
    return (
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 overflow-hidden bg-white dark:bg-zinc-950",
          isOver && isDragging && "bg-blue-50 dark:bg-blue-900/20",
        )}
      >
        <div className="flex flex-col items-center justify-center h-full text-zinc-400">
          <MessageSquare className="h-16 w-16 mb-4" />
          <p className="text-lg">채팅방을 선택하세요</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-1 overflow-hidden bg-white dark:bg-zinc-950",
        isOver && isDragging && "bg-blue-50 dark:bg-blue-900/20",
      )}
    >
      <ChatRoomContent roomId={activeTabId} />
    </div>
  );
};

interface ChatRoomContentProps {
  roomId: number;
}

const ChatRoomContent = ({ roomId }: ChatRoomContentProps) => {
  const user = useUserStore((s) => s.user);
  const { data: room } = useRoom(roomId);
  const { data: messages, isLoading } = useMessages(roomId);
  const { data: participants } = useParticipants(roomId);
  const sendMessageMutation = useSendMessage();
  const clearMessagesMutation = useClearMessages();

  // WebSocket 연결
  const { isConnected, sendMessage: sendSocketMessage } = useChatSocket(
    roomId,
    user?.userId || null,
  );

  const [inputValue, setInputValue] = useState("");
  const [showParticipants, setShowParticipants] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // 메시지가 업데이트되면 스크롤 아래로
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !user) return;

    const content = inputValue.trim();
    setInputValue(""); // 먼저 입력창 비우기

    // WebSocket이 연결되어 있으면 WebSocket으로 전송
    if (isConnected) {
      const success = sendSocketMessage(content);
      if (!success) {
        // WebSocket 전송 실패 시 REST API로 폴백
        await sendMessageMutation.mutateAsync({
          roomId,
          userId: user.userId,
          content,
        });
      }
    } else {
      // 연결이 안되어 있으면 REST API로 폴백
      await sendMessageMutation.mutateAsync({
        roomId,
        userId: user.userId,
        content,
      });
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
    <div className="flex flex-col h-full">
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
          {/* 내 아이디 표시 */}
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {user?.email}
          </span>
          {/* 메시지 삭제 버튼 */}
          <button
            onClick={() => {
              if (confirm("모든 메시지를 삭제하시겠습니까?")) {
                clearMessagesMutation.mutate(roomId);
              }
            }}
            disabled={clearMessagesMutation.isPending}
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
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-zinc-400">
            로딩 중...
          </div>
        ) : sortedMessages.length === 0 ? (
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
            disabled={sendMessageMutation.isPending}
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || sendMessageMutation.isPending}
            size="icon"
          >
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

interface ChatTabDragPreviewProps {
  tab: ChatTab;
}

const ChatTabDragPreview = ({ tab }: ChatTabDragPreviewProps) => {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-lg">
      <MessageSquare className="h-4 w-4 shrink-0" />
      <span className="text-sm font-medium truncate max-w-[120px]">
        {tab.title}
      </span>
    </div>
  );
};
