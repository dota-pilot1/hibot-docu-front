import { io, Socket } from "socket.io-client";
import { ChatMessage } from "@/features/chat-management";
import {
  addMessage,
  triggerParticipantsUpdate,
  clearMessages,
} from "./chatStore";

class ChatSocketManager {
  private socket: Socket | null = null;
  private joinedRooms: Set<number> = new Set();
  private userId: number | null = null;

  connect(userId: number) {
    // 이미 같은 userId로 연결되어 있으면 무시
    if (this.socket && this.userId === userId) {
      return;
    }

    // 기존 소켓이 있으면 정리
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }

    this.userId = userId;

    // WebSocket URL
    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:4001";

    console.log("Connecting to WebSocket:", `${wsUrl}/chat`);

    this.socket = io(`${wsUrl}/chat`, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    this.socket.on("connect", () => {
      console.log("Chat socket connected, socket id:", this.socket?.id);
      this.socket?.emit("register", { userId });

      // 연결 후 참여 중인 방들 다시 join
      if (this.joinedRooms.size > 0) {
        console.log(
          "Re-joining rooms after reconnect:",
          Array.from(this.joinedRooms),
        );
        for (const roomId of this.joinedRooms) {
          this.socket?.emit("joinRoom", { roomId, userId });
        }
      }
    });

    this.socket.on("disconnect", () => {
      console.log("Chat socket disconnected");
    });

    // 메시지 수신 → store에 직접 추가
    this.socket.on("newMessage", (message: ChatMessage) => {
      console.log("Received newMessage:", message);
      addMessage(message.roomId, message);
    });

    // 참여자 변경 → store 트리거
    this.socket.on("participantsChanged", (data: { roomId: number }) => {
      console.log("Participants changed:", data.roomId);
      triggerParticipantsUpdate(data.roomId);
    });

    // 메시지 전체 삭제 → store 비우기
    this.socket.on("messagesCleared", (data: { roomId: number }) => {
      console.log("Messages cleared:", data.roomId);
      clearMessages(data.roomId);
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
      this.joinedRooms.clear();
    }
  }

  joinRoom(roomId: number) {
    console.log(
      "joinRoom called:",
      roomId,
      "connected:",
      this.socket?.connected,
      "userId:",
      this.userId,
      "joinedRooms:",
      Array.from(this.joinedRooms),
    );

    // joinedRooms에 추가 (중복 허용 - Set이라 자동 처리됨)
    this.joinedRooms.add(roomId);

    if (!this.socket || !this.userId) {
      console.warn("Socket or userId not available, will join after connect");
      return;
    }

    // 소켓이 연결되어 있으면 바로 join, 아니면 연결 후 자동으로 join됨 (connect 핸들러에서)
    if (this.socket.connected) {
      console.log("Emitting joinRoom:", roomId);
      this.socket.emit("joinRoom", { roomId, userId: this.userId });
    } else {
      console.log(
        "Socket not connected, waiting for connect event to join room",
      );
    }
  }

  leaveRoom(roomId: number) {
    console.log("leaveRoom called:", roomId);

    this.joinedRooms.delete(roomId);

    if (!this.socket?.connected || !this.userId) {
      return;
    }

    this.socket.emit("leaveRoom", { roomId, userId: this.userId });
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

    return true;
  }

  clearMessages(roomId: number): boolean {
    if (!this.socket?.connected) {
      console.warn("Socket not connected");
      return false;
    }

    this.socket.emit("clearMessages", { roomId });
    return true;
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

// 싱글톤 인스턴스
export const chatSocket = new ChatSocketManager();
