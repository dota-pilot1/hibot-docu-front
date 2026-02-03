import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocketIO = (namespace: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const newSocket = io(`${socketUrl}${namespace}`, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log(`[${namespace}] Socket connected`);
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log(`[${namespace}] Socket disconnected`);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error(`[${namespace}] Connection error:`, error);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [namespace]);

  return {
    socket,
    isConnected,
  };
};
