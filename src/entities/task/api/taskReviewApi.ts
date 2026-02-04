import { api } from "@/shared/api";
import { TaskStatus } from "../model/types";

export interface TaskReview {
  id: number;
  taskId: number;
  status: TaskStatus;
  content: string; // Lexical editor JSON string
  createdAt: string;
  createdBy: number;
  createdByName?: string;
}

export interface CreateTaskReviewDto {
  status: string;
  content: string;
  createdBy: number;
}

export interface UpdateTaskReviewDto {
  content: string;
}

export const taskReviewApi = {
  /**
   * 특정 업무의 리뷰 목록 조회
   * @param status - optional, 특정 상태의 리뷰만 조회
   */
  getByTaskId: async (
    taskId: number,
    status?: string,
  ): Promise<TaskReview[]> => {
    const params = status ? { status } : {};
    const { data } = await api.get<TaskReview[]>(`/tasks/${taskId}/reviews`, {
      params,
    });
    return data;
  },

  /**
   * 리뷰 생성
   */
  create: async (
    taskId: number,
    dto: CreateTaskReviewDto,
  ): Promise<TaskReview> => {
    const { data } = await api.post<TaskReview>(
      `/tasks/${taskId}/reviews`,
      dto,
    );
    return data;
  },

  /**
   * 리뷰 상세 조회
   */
  getOne: async (taskId: number, id: number): Promise<TaskReview> => {
    const { data } = await api.get<TaskReview>(
      `/tasks/${taskId}/reviews/${id}`,
    );
    return data;
  },

  /**
   * 리뷰 수정
   */
  update: async (
    taskId: number,
    id: number,
    dto: UpdateTaskReviewDto,
  ): Promise<TaskReview> => {
    const { data } = await api.patch<TaskReview>(
      `/tasks/${taskId}/reviews/${id}`,
      dto,
    );
    return data;
  },

  /**
   * 리뷰 삭제
   */
  delete: async (taskId: number, id: number): Promise<void> => {
    await api.delete(`/tasks/${taskId}/reviews/${id}`);
  },
};
