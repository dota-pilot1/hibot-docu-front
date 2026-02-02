import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskApi } from "../api/taskApi";
import { toast } from "sonner";

// Task 이슈 목록 조회
export const useTaskIssues = (taskId: number | null) => {
  return useQuery({
    queryKey: ["taskIssues", taskId],
    queryFn: () => taskApi.getTaskIssues(taskId!),
    enabled: !!taskId,
  });
};

// Task 이슈 생성
export const useCreateTaskIssue = (taskId: number | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => taskApi.createTaskIssue(taskId!, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskIssues", taskId] });
      // 활동 로그도 갱신
      queryClient.invalidateQueries({ queryKey: ["userActivities"] });
      toast.success("이슈가 등록되었습니다");
    },
    onError: () => {
      toast.error("이슈 등록에 실패했습니다");
    },
  });
};

// Task 이슈 수정
export const useUpdateTaskIssue = (taskId: number | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      issueId,
      data,
    }: {
      issueId: number;
      data: { content?: string; isResolved?: boolean };
    }) => taskApi.updateTaskIssue(issueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskIssues", taskId] });
      toast.success("이슈가 수정되었습니다");
    },
    onError: () => {
      toast.error("이슈 수정에 실패했습니다");
    },
  });
};

// Task 이슈 삭제
export const useDeleteTaskIssue = (taskId: number | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (issueId: number) => taskApi.deleteTaskIssue(issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskIssues", taskId] });
      toast.success("이슈가 삭제되었습니다");
    },
    onError: () => {
      toast.error("이슈 삭제에 실패했습니다");
    },
  });
};

// Task 이슈 해결 처리
export const useResolveTaskIssue = (taskId: number | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (issueId: number) => taskApi.resolveTaskIssue(issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskIssues", taskId] });
      toast.success("이슈가 해결 처리되었습니다");
    },
    onError: () => {
      toast.error("이슈 해결 처리에 실패했습니다");
    },
  });
};
