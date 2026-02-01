import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { taskApi, CreateTaskDto, UpdateTaskDto } from "../api/taskApi";
import { Task, TaskStatus, taskStatusConfig } from "../model/types";

// Query Keys
export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (filters: { userId?: number }) =>
    [...taskKeys.lists(), filters] as const,
  byUser: (userId: number) => [...taskKeys.all, "user", userId] as const,
  current: (userId: number) => [...taskKeys.all, "current", userId] as const,
  detail: (id: number) => [...taskKeys.all, "detail", id] as const,
  stats: (userId: number) => [...taskKeys.all, "stats", userId] as const,
};

// 전체 Task 조회
export const useAllTasks = () => {
  return useQuery({
    queryKey: taskKeys.all,
    queryFn: () => taskApi.getAll(),
  });
};

// 유저별 Task 조회
export const useUserTasks = (userId: number) => {
  return useQuery({
    queryKey: taskKeys.byUser(userId),
    queryFn: () => taskApi.getByUser(userId),
  });
};

// 현재 작업 조회
export const useCurrentTask = (userId: number) => {
  return useQuery({
    queryKey: taskKeys.current(userId),
    queryFn: () => taskApi.getCurrentTask(userId),
  });
};

// Task 통계 조회
export const useTaskStats = (userId: number) => {
  return useQuery({
    queryKey: taskKeys.stats(userId),
    queryFn: () => taskApi.getUserStats(userId),
  });
};

// Task 생성
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskDto) => taskApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success("새 Task가 생성되었습니다.");
    },
    onError: () => {
      toast.error("Task 생성에 실패했습니다.");
    },
  });
};

// Task 수정
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTaskDto }) =>
      taskApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
    onError: () => {
      toast.error("Task 수정에 실패했습니다.");
    },
  });
};

// Task 상태 변경
export const useUpdateTaskStatus = (userId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: TaskStatus }) =>
      taskApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: taskKeys.current(userId),
        });
        queryClient.invalidateQueries({
          queryKey: ["activities", userId],
        });
        queryClient.invalidateQueries({
          queryKey: taskKeys.stats(userId),
        });
      }
      const statusLabel = taskStatusConfig[variables.status].label;
      toast.success(`상태가 "${statusLabel}"(으)로 변경되었습니다.`);
    },
    onError: () => {
      toast.error("상태 변경에 실패했습니다.");
    },
  });
};

// Task 삭제
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => taskApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success("Task가 삭제되었습니다.");
    },
    onError: () => {
      toast.error("Task 삭제에 실패했습니다.");
    },
  });
};

// 현재 작업 설정
export const useSetCurrentTask = (userId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: number) => taskApi.setCurrentTask(taskId),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: taskKeys.current(userId),
        });
      }
      toast.success(`"${task.title}" 을(를) 현재 작업으로 설정했습니다.`);
    },
    onError: () => {
      toast.error("현재 작업 설정에 실패했습니다.");
    },
  });
};

// 여러 Task 일괄 수정 (배치 저장용)
export const useBatchUpdateTasks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { id: number; data: UpdateTaskDto }[]) => {
      const promises = updates.map(({ id, data }) => taskApi.update(id, data));
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success("변경사항이 저장되었습니다.");
    },
    onError: () => {
      toast.error("저장에 실패했습니다.");
    },
  });
};

// 여러 Task 일괄 삭제
export const useBatchDeleteTasks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const promises = ids.map((id) => taskApi.delete(id));
      return Promise.all(promises);
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success(`${ids.length}개의 Task가 삭제되었습니다.`);
    },
    onError: () => {
      toast.error("삭제에 실패했습니다.");
    },
  });
};
