"use client";

import { useState } from "react";
import { FolderPlus, PanelLeftClose, PanelLeft, Users } from "lucide-react";
import {
  useProjectsWithTeams,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useCreateTeam,
  useUpdateTeam,
  useDeleteTeam,
  useCreateRoom,
  useUpdateRoom,
  useDeleteRoom,
  ChatProject,
  ChatTeam,
  ChatRoom,
} from "@/features/chat-management";
import { useChatStore } from "../model/useChatStore";
import { ChatProjectItem } from "./ChatProjectItem";
import { ChatTeamItem } from "./ChatTeamItem";
import { Button } from "@/shared/ui/button";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { Input } from "@/shared/ui/input";

export const ChatSidebar = () => {
  const isOpen = useChatStore((s) => s.isOpen);
  const toggle = useChatStore((s) => s.toggle);
  const openTab = useChatStore((s) => s.openTab);

  const { data: projects, isLoading } = useProjectsWithTeams();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();

  // 다이얼로그 상태
  const [projectDialog, setProjectDialog] = useState<{
    open: boolean;
    mode: "create" | "rename";
    project?: ChatProject;
  }>({ open: false, mode: "create" });
  const [projectName, setProjectName] = useState("");

  const [teamDialog, setTeamDialog] = useState<{
    open: boolean;
    mode: "create" | "rename";
    projectId?: number;
    team?: ChatTeam;
  }>({ open: false, mode: "create" });
  const [teamName, setTeamName] = useState("");

  const [roomDialog, setRoomDialog] = useState<{
    open: boolean;
    mode: "create" | "rename";
    teamId?: number;
    room?: ChatRoom;
  }>({ open: false, mode: "create" });
  const [roomName, setRoomName] = useState("");

  // 프로젝트 다이얼로그 핸들러
  const handleOpenCreateProject = () => {
    setProjectName("");
    setProjectDialog({ open: true, mode: "create" });
  };

  const handleOpenRenameProject = (project: ChatProject) => {
    setProjectName(project.name);
    setProjectDialog({ open: true, mode: "rename", project });
  };

  const handleProjectSubmit = async () => {
    if (!projectName.trim()) return;

    if (projectDialog.mode === "create") {
      await createProject.mutateAsync({ name: projectName.trim() });
    } else if (projectDialog.project) {
      await updateProject.mutateAsync({
        id: projectDialog.project.id,
        data: { name: projectName.trim() },
      });
    }
    setProjectDialog({ open: false, mode: "create" });
  };

  const handleDeleteProject = async (projectId: number) => {
    if (
      confirm(
        "프로젝트를 삭제하시겠습니까? 프로젝트 내 팀은 미분류로 이동됩니다.",
      )
    ) {
      await deleteProject.mutateAsync(projectId);
    }
  };

  // 팀 다이얼로그 핸들러
  const handleOpenCreateTeam = (projectId?: number) => {
    setTeamName("");
    setTeamDialog({ open: true, mode: "create", projectId });
  };

  const handleOpenRenameTeam = (team: ChatTeam) => {
    setTeamName(team.name);
    setTeamDialog({ open: true, mode: "rename", team });
  };

  const handleTeamSubmit = async () => {
    if (!teamName.trim()) return;

    if (teamDialog.mode === "create") {
      const newTeam = await createTeam.mutateAsync({
        name: teamName.trim(),
        projectId: teamDialog.projectId,
      });
      openTab({ id: newTeam.id, title: newTeam.name });
    } else if (teamDialog.team) {
      await updateTeam.mutateAsync({
        id: teamDialog.team.id,
        data: { name: teamName.trim() },
      });
    }
    setTeamDialog({ open: false, mode: "create" });
  };

  const handleDeleteTeam = async (teamId: number) => {
    if (confirm("팀을 삭제하시겠습니까?")) {
      await deleteTeam.mutateAsync(teamId);
    }
  };

  // 채팅방 다이얼로그 핸들러
  const handleOpenCreateRoom = (teamId: number) => {
    setRoomName("");
    setRoomDialog({ open: true, mode: "create", teamId });
  };

  const handleOpenRenameRoom = (room: ChatRoom) => {
    setRoomName(room.name);
    setRoomDialog({ open: true, mode: "rename", room, teamId: room.teamId });
  };

  const handleRoomSubmit = async () => {
    if (!roomName.trim()) return;

    if (roomDialog.mode === "create" && roomDialog.teamId) {
      const newRoom = await createRoom.mutateAsync({
        teamId: roomDialog.teamId,
        name: roomName.trim(),
      });
      openTab({ id: newRoom.id, title: newRoom.name });
    } else if (roomDialog.room) {
      await updateRoom.mutateAsync({
        id: roomDialog.room.id,
        data: { name: roomName.trim() },
      });
    }
    setRoomDialog({ open: false, mode: "create" });
  };

  const handleDeleteRoom = async (roomId: number) => {
    if (confirm("채팅방을 삭제하시겠습니까?")) {
      await deleteRoom.mutateAsync(roomId);
    }
  };

  // 축소 상태
  if (!isOpen) {
    return (
      <div className="h-full flex flex-col items-center py-4 bg-white dark:bg-zinc-900">
        <Button variant="ghost" size="icon" onClick={toggle}>
          <PanelLeft className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  // 미분류 팀 (projectId가 null인 팀들)
  const unassignedTeams =
    projects?.flatMap((p) => p.teams.filter((t) => t.projectId === null)) || [];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200 dark:border-zinc-700">
        <span className="font-medium text-sm">채팅</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleOpenCreateProject}
            title="새 프로젝트"
          >
            <FolderPlus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={toggle}
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 프로젝트/팀 목록 */}
      <div className="flex-1 overflow-y-auto py-2">
        {isLoading ? (
          <div className="px-3 py-2 text-sm text-zinc-400">로딩 중...</div>
        ) : (
          <>
            {/* 프로젝트 목록 */}
            {projects?.map((project) => (
              <ChatProjectItem
                key={project.id}
                project={project}
                onCreateTeam={handleOpenCreateTeam}
                onRenameProject={handleOpenRenameProject}
                onDeleteProject={handleDeleteProject}
                onRenameTeam={handleOpenRenameTeam}
                onDeleteTeam={handleDeleteTeam}
                onCreateRoom={handleOpenCreateRoom}
                onRenameRoom={handleOpenRenameRoom}
                onDeleteRoom={handleDeleteRoom}
              />
            ))}

            {/* 미분류 팀 */}
            {unassignedTeams.length > 0 && (
              <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                <div className="px-3 py-1 text-xs text-zinc-400 font-medium">
                  미분류
                </div>
                {unassignedTeams.map((team) => (
                  <ChatTeamItem
                    key={team.id}
                    team={team}
                    onRename={handleOpenRenameTeam}
                    onDelete={handleDeleteTeam}
                    onCreateRoom={handleOpenCreateRoom}
                    onRenameRoom={handleOpenRenameRoom}
                    onDeleteRoom={handleDeleteRoom}
                  />
                ))}
              </div>
            )}

            {/* 빈 상태 */}
            {projects?.length === 0 && unassignedTeams.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
                <Users className="h-10 w-10 mb-2" />
                <p className="text-sm">채팅이 없습니다</p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => handleOpenCreateTeam()}
                >
                  새 팀 만들기
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 프로젝트 다이얼로그 */}
      <FormDialog
        open={projectDialog.open}
        onOpenChange={(open) => setProjectDialog({ ...projectDialog, open })}
        title={
          projectDialog.mode === "create" ? "새 프로젝트" : "프로젝트 이름 변경"
        }
        submitLabel={projectDialog.mode === "create" ? "생성" : "저장"}
        onSubmit={handleProjectSubmit}
        isLoading={createProject.isPending || updateProject.isPending}
        maxWidth="sm:max-w-sm"
      >
        <Input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="프로젝트 이름"
          autoFocus
        />
      </FormDialog>

      {/* 팀 다이얼로그 */}
      <FormDialog
        open={teamDialog.open}
        onOpenChange={(open) => setTeamDialog({ ...teamDialog, open })}
        title={teamDialog.mode === "create" ? "새 팀" : "팀 이름 변경"}
        submitLabel={teamDialog.mode === "create" ? "생성" : "저장"}
        onSubmit={handleTeamSubmit}
        isLoading={createTeam.isPending || updateTeam.isPending}
        maxWidth="sm:max-w-sm"
      >
        <Input
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="팀 이름"
          autoFocus
        />
      </FormDialog>

      {/* 채팅방 다이얼로그 */}
      <FormDialog
        open={roomDialog.open}
        onOpenChange={(open) => setRoomDialog({ ...roomDialog, open })}
        title={roomDialog.mode === "create" ? "새 채팅방" : "채팅방 이름 변경"}
        submitLabel={roomDialog.mode === "create" ? "생성" : "저장"}
        onSubmit={handleRoomSubmit}
        isLoading={createRoom.isPending || updateRoom.isPending}
        maxWidth="sm:max-w-sm"
      >
        <Input
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="채팅방 이름"
          autoFocus
        />
      </FormDialog>
    </div>
  );
};
