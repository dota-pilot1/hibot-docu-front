"use client";

import { useState } from "react";
import {
  ChevronRight,
  Folder,
  FolderOpen,
  MoreHorizontal,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { ChatProject, ChatTeam } from "@/features/chat-management";
import { useChatStore } from "../model/useChatStore";
import { ChatTeamItem } from "./ChatTeamItem";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

interface ChatProjectItemProps {
  project: ChatProject;
  onCreateTeam: (projectId: number) => void;
  onRenameProject: (project: ChatProject) => void;
  onDeleteProject: (projectId: number) => void;
  onRenameTeam: (team: ChatTeam) => void;
  onDeleteTeam: (teamId: number) => void;
}

export const ChatProjectItem = ({
  project,
  onCreateTeam,
  onRenameProject,
  onDeleteProject,
  onRenameTeam,
  onDeleteTeam,
}: ChatProjectItemProps) => {
  const expandedProjects = useChatStore((s) => s.expandedProjects);
  const toggleProject = useChatStore((s) => s.toggleProject);
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = expandedProjects.has(project.id);

  return (
    <div>
      {/* 프로젝트 헤더 */}
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer",
          "hover:bg-zinc-100 dark:hover:bg-zinc-800",
          "group",
        )}
        onClick={() => toggleProject(project.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <ChevronRight
          className={cn(
            "h-4 w-4 text-zinc-400 transition-transform",
            isExpanded && "rotate-90",
          )}
        />
        {isExpanded ? (
          <FolderOpen className="h-4 w-4 text-blue-500" />
        ) : (
          <Folder className="h-4 w-4 text-blue-500" />
        )}
        <span className="flex-1 text-sm truncate">{project.name}</span>
        <span className="text-xs text-zinc-400">{project.teams.length}</span>

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
            <DropdownMenuItem onClick={() => onCreateTeam(project.id)}>
              <Plus className="h-4 w-4 mr-2" />
              새 팀
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRenameProject(project)}>
              <Pencil className="h-4 w-4 mr-2" />
              이름 변경
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeleteProject(project.id)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 팀 목록 */}
      {isExpanded && (
        <div className="ml-4 border-l border-zinc-200 dark:border-zinc-700">
          {project.teams.map((team) => (
            <ChatTeamItem
              key={team.id}
              team={team}
              onRename={onRenameTeam}
              onDelete={onDeleteTeam}
            />
          ))}
          {project.teams.length === 0 && (
            <div className="px-4 py-2 text-xs text-zinc-400">팀 없음</div>
          )}
        </div>
      )}
    </div>
  );
};
