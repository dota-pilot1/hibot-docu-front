export type TaskStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "blocked"
  | "review";

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface TaskActivity {
  id: number;
  taskId: number;
  userId: number;
  type: "created" | "updated" | "completed" | "commented" | "status_changed";
  description: string;
  createdAt: string;
}

// 상태 표시 설정
export const taskStatusConfig: Record<
  TaskStatus,
  { label: string; color: string; bgColor: string }
> = {
  pending: {
    label: "대기",
    color: "text-yellow-800",
    bgColor: "bg-yellow-100",
  },
  in_progress: {
    label: "진행중",
    color: "text-green-800",
    bgColor: "bg-green-100",
  },
  completed: {
    label: "완료",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
  blocked: {
    label: "막힘",
    color: "text-red-800",
    bgColor: "bg-red-100",
  },
  review: {
    label: "리뷰중",
    color: "text-blue-800",
    bgColor: "bg-blue-100",
  },
};

// 우선순위 표시 설정
export const taskPriorityConfig: Record<
  TaskPriority,
  { label: string; color: string; icon: string }
> = {
  high: { label: "높음", color: "text-red-600", icon: "●" },
  medium: { label: "중간", color: "text-yellow-600", icon: "●" },
  low: { label: "낮음", color: "text-gray-500", icon: "●" },
};
