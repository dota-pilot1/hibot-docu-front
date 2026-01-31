"use client";

import { useState } from "react";
import {
  Users,
  MoreHorizontal,
  Pencil,
  Trash2,
  ChevronRight,
  ChevronDown,
  Plus,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { ChatTeam, ChatRoom, useRoomsByTeam } from "@/features/chat-management";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { ChatRoomItem } from "./ChatRoomItem";

interface ChatTeamItemProps {
  team: ChatTeam;
  onRename: (team: ChatTeam) => void;
  onDelete: (teamId: number) => void;
  onCreateRoom: (teamId: number) => void;
  onRenameRoom: (room: ChatRoom) => void;
  onDeleteRoom: (roomId: number) => void;
}

export const ChatTeamItem = ({
  team,
  onRename,
  onDelete,
  onCreateRoom,
  onRenameRoom,
  onDeleteRoom,
}: ChatTeamItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: rooms, isLoading } = useRoomsByTeam(
    isExpanded ? team.id : null,
  );

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      {/* 팀 헤더 */}
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-1.5 cursor-pointer",
          "hover:bg-zinc-100 dark:hover:bg-zinc-800",
          "group",
        )}
      >
        {/* 펼치기/접기 버튼 */}
        <button
          className="p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
          onClick={handleToggle}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          )}
        </button>

        <Users className="h-4 w-4 text-zinc-400 shrink-0" />
        <span
          className="flex-1 text-sm truncate cursor-pointer"
          onClick={handleToggle}
        >
          {team.name}
        </span>

        {/* 채팅방 추가 버튼 */}
        <button
          className={cn(
            "p-1 rounded opacity-0 group-hover:opacity-100",
            "hover:bg-zinc-200 dark:hover:bg-zinc-700",
            "transition-opacity",
          )}
          onClick={(e) => {
            e.stopPropagation();
            onCreateRoom(team.id);
          }}
          title="새 채팅방"
        >
          <Plus className="h-4 w-4 text-zinc-500" />
        </button>

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
            <DropdownMenuItem onClick={() => onCreateRoom(team.id)}>
              <Plus className="h-4 w-4 mr-2" />새 채팅방
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRename(team)}>
              <Pencil className="h-4 w-4 mr-2" />
              이름 변경
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(team.id)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 채팅방 목록 */}
      {isExpanded && (
        <div className="ml-2">
          {isLoading ? (
            <div className="px-3 py-1 text-xs text-zinc-400">로딩 중...</div>
          ) : rooms && rooms.length > 0 ? (
            rooms.map((room) => (
              <ChatRoomItem
                key={room.id}
                room={room}
                onRename={onRenameRoom}
                onDelete={onDeleteRoom}
              />
            ))
          ) : (
            <div className="px-6 py-1 text-xs text-zinc-400">
              채팅방이 없습니다
            </div>
          )}
        </div>
      )}
    </div>
  );
};
