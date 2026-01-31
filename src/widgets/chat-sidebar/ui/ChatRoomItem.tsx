"use client";

import { MessageSquare, MoreHorizontal, Pencil, Trash2, Bot } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { ChatRoom } from "@/features/chat-management";
import { useChatStore } from "../model/useChatStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

interface ChatRoomItemProps {
  room: ChatRoom;
  onRename: (room: ChatRoom) => void;
  onDelete: (roomId: number) => void;
}

export const ChatRoomItem = ({
  room,
  onRename,
  onDelete,
}: ChatRoomItemProps) => {
  const panels = useChatStore((s) => s.panels);
  const activePanelId = useChatStore((s) => s.activePanelId);
  const openTab = useChatStore((s) => s.openTab);

  const activePanel = panels.find((p) => p.id === activePanelId);
  const isActive = activePanel?.activeTabId === room.id;

  const handleClick = () => {
    openTab({ id: room.id, title: room.name });
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 cursor-pointer ml-4",
        "hover:bg-zinc-100 dark:hover:bg-zinc-800",
        "group",
        isActive && "bg-blue-50 dark:bg-blue-900/20",
      )}
      onClick={handleClick}
    >
      {room.roomType === "AI_ENABLED" ? (
        <Bot className="h-4 w-4 text-purple-500 shrink-0" />
      ) : (
        <MessageSquare className="h-4 w-4 text-zinc-400 shrink-0" />
      )}
      <span
        className={cn(
          "flex-1 text-sm truncate",
          isActive && "text-blue-600 dark:text-blue-400 font-medium",
        )}
      >
        {room.name}
      </span>

      {/* 컨텍스트 메뉴 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "p-1 rounded opacity-0 group-hover:opacity-100",
              "hover:bg-zinc-200 dark:hover:bg-zinc-700",
              "transition-opacity",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4 text-zinc-500" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onRename(room)}>
            <Pencil className="h-4 w-4 mr-2" />
            이름 변경
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(room.id)}
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
