import { api } from "@/shared/api";
import type {
  Task,
  TaskStatus,
  TaskPriority,
  TaskActivity,
} from "../model/types";

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId: number;
  dueDate?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: number;
  dueDate?: string | null;
}

export interface TaskStats {
  todayTotal: number;
  todayCompleted: number;
}

export interface UserMemo {
  id: number;
  userId: number;
  memo: string | null;
  updatedAt: string;
  updatedBy: number | null;
}

export const taskApi = {
  // Task 목록 조회
  getAll: () => api.get<Task[]>("/tasks").then((res) => res.data),

  // 특정 유저의 Task 목록
  getByUser: (userId: number) =>
    api.get<Task[]>(`/tasks/user/${userId}`).then((res) => res.data),

  // Task 상세
  getById: (id: number) =>
    api.get<Task>(`/tasks/${id}`).then((res) => res.data),

  // Task 생성
  create: (data: CreateTaskDto) =>
    api.post<Task>("/tasks", data).then((res) => res.data),

  // Task 수정
  update: (id: number, data: UpdateTaskDto) =>
    api.patch<Task>(`/tasks/${id}`, data).then((res) => res.data),

  // Task 상태 변경
  updateStatus: (id: number, status: TaskStatus) =>
    api.patch<Task>(`/tasks/${id}/status`, { status }).then((res) => res.data),

  // Task 삭제
  delete: (id: number) => api.delete(`/tasks/${id}`),

  // 유저 Task 통계
  getUserStats: (userId: number) =>
    api.get<TaskStats>(`/tasks/user/${userId}/stats`).then((res) => res.data),

  // 유저 최근 활동
  getUserActivities: (userId: number) =>
    api
      .get<TaskActivity[]>(`/users/${userId}/activities`)
      .then((res) => res.data),

  // 유저 메모 조회
  getUserMemo: (userId: number) =>
    api.get<UserMemo | null>(`/users/${userId}/memo`).then((res) => res.data),

  // 유저 메모 수정
  updateUserMemo: (userId: number, memo: string) =>
    api
      .patch<UserMemo>(`/users/${userId}/memo`, { memo })
      .then((res) => res.data),
};
