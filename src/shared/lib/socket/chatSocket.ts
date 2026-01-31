import { io, Socket } from "socket.io-client";
import { ChatMessage } from "@/features/chat-management";

type MessageHandler = (message: ChatMessage) => void;

class ChatSocketManager {
  private socket: Socket | null = null;
  private messageHandlers: Map<number, Set<MessageHandler>> = new Map();
  private currentRoomId: number | null = null;
  private userId: number | null = null;

  connect(userId: number) {
    if (this.socket?.connected && this.userId === userId) {
      return;
    }

    this.userId = userId;

    // WebSocket URL: NEXT_PUBLIC_WS_URL 또는 API URL에서 /api 제거
    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL ||
      process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
      "http://localhost:4001";

    console.log("Connecting to WebSocket:", `${wsUrl}/chat`);

    this.socket = io(`${wsUrl}/chat`, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    this.socket.on("connect", () => {
      console.log("Chat socket connected");
      // 사용자 등록
      this.socket?.emit("register", { userId });

      // 연결 후 현재 방이 있으면 다시 join
      if (this.currentRoomId) {
        console.log("Re-joining room after reconnect:", this.currentRoomId);
        this.socket?.emit("joinRoom", { roomId: this.currentRoomId, userId });
      }
    });

    this.socket.on("disconnect", () => {
      console.log("Chat socket disconnected");
    });

    this.socket.on("newMessage", (message: ChatMessage) => {
      console.log("Received newMessage:", message);
      // 해당 채팅방의 핸들러들에게 메시지 전달
      const handlers = this.messageHandlers.get(message.roomId);
      console.log(
        "Handlers for room",
        message.roomId,
        ":",
        handlers?.size || 0,
      );
      if (handlers) {
        handlers.forEach((handler) => handler(message));
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("Chat socket connection error:", error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      this.currentRoomId = null;
    }
  }

  joinRoom(roomId: number) {
    console.log(
      "joinRoom called:",
      roomId,
      "connected:",
      this.socket?.connected,
    );

    // 현재 방 ID 저장 (연결 전이라도)
    this.currentRoomId = roomId;

    if (!this.socket?.connected || !this.userId) {
      console.warn("Socket not connected yet, will join after connect");
      return;
    }

    console.log("Emitting joinRoom:", roomId);
    this.socket.emit("joinRoom", { roomId, userId: this.userId });
  }

  leaveRoom(roomId: number) {
    if (!this.socket?.connected || !this.userId) {
      return;
    }

    this.socket.emit("leaveRoom", { roomId, userId: this.userId });
    if (this.currentRoomId === roomId) {
      this.currentRoomId = null;
    }
  }

  sendMessage(
    roomId: number,
    content: string,
    messageType: "CHAT" | "SYSTEM" | "AI" = "CHAT",
  ): boolean {
    if (!this.socket?.connected || !this.userId) {
      console.warn("Socket not connected");
      return false;
    }

    this.socket.emit("sendMessage", {
      roomId,
      userId: this.userId,
      content,
      messageType,
    });

    // 서버에서 newMessage 이벤트로 브로드캐스트하므로 여기서는 true만 반환
    return true;
  }

  // 메시지 핸들러 등록
  onMessage(roomId: number, handler: MessageHandler) {
    if (!this.messageHandlers.has(roomId)) {
      this.messageHandlers.set(roomId, new Set());
    }
    this.messageHandlers.get(roomId)!.add(handler);

    // cleanup 함수 반환
    return () => {
      const handlers = this.messageHandlers.get(roomId);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.messageHandlers.delete(roomId);
        }
      }
    };
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

// 싱글톤 인스턴스
export const chatSocket = new ChatSocketManager();
