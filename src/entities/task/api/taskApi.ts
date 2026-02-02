import { api } from "@/shared/api";
import type {
  Task,
  TaskStatus,
  TaskPriority,
  TaskActivity,
  TaskIssue,
  TaskIssueReply,
  TaskDetail,
  TaskDetailImage,
  TaskDetailAttachment,
  UpdateTaskDetailDto,
} from "../model/types";

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: number;
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

  // 현재 작업 설정
  setCurrentTask: (id: number) =>
    api.patch<Task>(`/tasks/${id}/current`).then((res) => res.data),

  // 현재 작업 조회
  getCurrentTask: (userId: number) =>
    api
      .get<Task | null>(`/tasks/user/${userId}/current`)
      .then((res) => res.data),

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

  // 부서별 오늘 활동 조회
  getDepartmentActivitiesToday: (departmentId: number) =>
    api
      .get<
        TaskActivity[]
      >(`/tasks/departments/${departmentId}/activities/today`)
      .then((res) => res.data),

  // 부서별 오늘 활동 수 요약
  getDepartmentActivitySummaryToday: () =>
    api
      .get<
        { departmentId: number; departmentName: string; count: number }[]
      >("/tasks/departments/activities/today/summary")
      .then((res) => res.data),

  // ============================================
  // Task Issues (이슈/댓글)
  // ============================================

  // Task 이슈 목록 조회
  getTaskIssues: (taskId: number) =>
    api.get<TaskIssue[]>(`/tasks/${taskId}/issues`).then((res) => res.data),

  // Task 이슈 생성
  createTaskIssue: (taskId: number, content: string) =>
    api
      .post<TaskIssue>(`/tasks/${taskId}/issues`, { content })
      .then((res) => res.data),

  // Task 이슈 수정
  updateTaskIssue: (
    issueId: number,
    data: { content?: string; isResolved?: boolean },
  ) =>
    api
      .patch<TaskIssue>(`/tasks/issues/${issueId}`, data)
      .then((res) => res.data),

  // Task 이슈 삭제
  deleteTaskIssue: (issueId: number) => api.delete(`/tasks/issues/${issueId}`),

  // Task 이슈 해결 처리
  resolveTaskIssue: (issueId: number) =>
    api
      .patch<TaskIssue>(`/tasks/issues/${issueId}/resolve`)
      .then((res) => res.data),

  // ============================================
  // Issue Replies (이슈 답변)
  // ============================================

  // 이슈 답변 목록 조회
  getIssueReplies: (issueId: number) =>
    api
      .get<TaskIssueReply[]>(`/tasks/issues/${issueId}/replies`)
      .then((res) => res.data),

  // 이슈 답변 생성
  createIssueReply: (issueId: number, content: string, parentId?: number) =>
    api
      .post<TaskIssueReply>(`/tasks/issues/${issueId}/replies`, {
        content,
        parentId,
      })
      .then((res) => res.data),

  // 이슈 답변 수정
  updateIssueReply: (replyId: number, content: string) =>
    api
      .patch<TaskIssueReply>(`/tasks/issues/replies/${replyId}`, { content })
      .then((res) => res.data),

  // 이슈 답변 삭제
  deleteIssueReply: (replyId: number) =>
    api.delete(`/tasks/issues/replies/${replyId}`),

  // ============================================
  // Task Details (업무 상세)
  // ============================================

  // 업무 상세 조회
  getTaskDetail: (taskId: number) =>
    api.get<TaskDetail>(`/tasks/${taskId}/detail`).then((res) => res.data),

  // 업무 상세 수정
  updateTaskDetail: (taskId: number, data: UpdateTaskDetailDto) =>
    api
      .patch<TaskDetail>(`/tasks/${taskId}/detail`, data)
      .then((res) => res.data),

  // 업무 상세 삭제
  deleteTaskDetail: (taskId: number) => api.delete(`/tasks/${taskId}/detail`),

  // 이미지 목록 조회
  getTaskDetailImages: (taskId: number) =>
    api
      .get<TaskDetailImage[]>(`/tasks/${taskId}/detail/images`)
      .then((res) => res.data),

  // 이미지 업로드
  uploadTaskImage: (
    taskId: number,
    file: File,
    caption?: string,
    altText?: string,
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    if (caption) formData.append("caption", caption);
    if (altText) formData.append("altText", altText);

    return api
      .post<TaskDetailImage>(`/tasks/${taskId}/detail/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  },

  // 이미지 정보 수정
  updateTaskImage: (
    taskId: number,
    imageId: number,
    data: { caption?: string; altText?: string; displayOrder?: number },
  ) =>
    api
      .patch<TaskDetailImage>(`/tasks/${taskId}/detail/images/${imageId}`, data)
      .then((res) => res.data),

  // 이미지 삭제
  deleteTaskImage: (taskId: number, imageId: number) =>
    api.delete(`/tasks/${taskId}/detail/images/${imageId}`),

  // 이미지 순서 변경
  reorderTaskImages: (taskId: number, imageIds: number[]) =>
    api.patch(`/tasks/${taskId}/detail/images/reorder`, { imageIds }),

  // 첨부파일 목록 조회
  getTaskDetailAttachments: (taskId: number) =>
    api
      .get<TaskDetailAttachment[]>(`/tasks/${taskId}/detail/attachments`)
      .then((res) => res.data),

  // 첨부파일 업로드
  uploadTaskAttachment: (taskId: number, file: File, description?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (description) formData.append("description", description);

    return api
      .post<TaskDetailAttachment>(
        `/tasks/${taskId}/detail/attachments`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      )
      .then((res) => res.data);
  },

  // 첨부파일 정보 수정
  updateTaskAttachment: (
    taskId: number,
    attachmentId: number,
    data: { description?: string; displayOrder?: number },
  ) =>
    api
      .patch<TaskDetailAttachment>(
        `/tasks/${taskId}/detail/attachments/${attachmentId}`,
        data,
      )
      .then((res) => res.data),

  // 첨부파일 삭제
  deleteTaskAttachment: (taskId: number, attachmentId: number) =>
    api.delete(`/tasks/${taskId}/detail/attachments/${attachmentId}`),
};
