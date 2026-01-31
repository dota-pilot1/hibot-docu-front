import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi, ChatProject, ChatTeam } from "../api/chatApi";

// 프로젝트 + 팀 목록 조회
export const useProjectsWithTeams = () => {
  return useQuery<ChatProject[]>({
    queryKey: ["chats", "projects"],
    queryFn: chatApi.getProjectsWithTeams,
    staleTime: 1000 * 60 * 5,
  });
};

// 팀 상세 조회
export const useTeam = (id: number | null) => {
  return useQuery<ChatTeam>({
    queryKey: ["chats", "team", id],
    queryFn: () => chatApi.getTeam(id!),
    enabled: id !== null,
    staleTime: 1000 * 60 * 5,
  });
};

// 프로젝트 생성
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats", "projects"] });
    },
  });
};

// 프로젝트 수정
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { name?: string; description?: string };
    }) => chatApi.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats", "projects"] });
    },
  });
};

// 프로젝트 삭제
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats", "projects"] });
    },
  });
};

// 팀 생성
export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats", "projects"] });
    },
  });
};

// 팀 수정
export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { name?: string; description?: string };
    }) => chatApi.updateTeam(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chats", "projects"] });
      queryClient.invalidateQueries({
        queryKey: ["chats", "team", variables.id],
      });
    },
  });
};

// 팀 삭제
export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatApi.deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats", "projects"] });
    },
  });
};

// 팀 프로젝트 이동
export const useMoveTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, projectId }: { id: number; projectId: number | null }) =>
      chatApi.moveTeam(id, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats", "projects"] });
    },
  });
};
