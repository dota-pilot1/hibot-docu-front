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
  isCurrent: boolean;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  issueCount?: number;
}

export interface TaskActivity {
  id: number;
  taskId: number;
  userId: number;
  type: "created" | "updated" | "completed" | "commented" | "status_changed";
  description: string;
  createdAt: string;
}

export interface TaskIssue {
  id: number;
  taskId: number;
  userId: number;
  content: string;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string | null;
    profileImage: string | null;
  };
}

export interface TaskIssueReply {
  id: number;
  issueId: number;
  parentId: number | null; // 대댓글인 경우 부모 답변 ID
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string | null;
    profileImage: string | null;
  };
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

// ============================================
// Task Detail (업무 상세)
// ============================================

export type TaskDifficulty = "easy" | "medium" | "hard";

export interface TaskDetailImage {
  id: number;
  taskDetailId: number;
  originalName: string;
  storedName: string;
  s3Url: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  caption?: string;
  altText?: string;
  displayOrder: number;
  createdAt: string;
  uploadedBy?: number;
}

export interface TaskDetailAttachment {
  id: number;
  taskDetailId: number;
  originalName: string;
  storedName: string;
  s3Url: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileType?: string;
  description?: string;
  displayOrder: number;
  createdAt: string;
  uploadedBy?: number;
}

export interface ChecklistItem {
  id: number;
  text: string;
  completed: boolean;
}

export interface LinkItem {
  title: string;
  url: string;
}

export interface TaskDetail {
  id: number;
  taskId: number;
  description?: string;
  figmaUrl?: string;
  figmaEmbedKey?: string;
  estimatedHours?: string;
  actualHours?: string;
  difficulty?: TaskDifficulty;
  progress: number;
  tags: string[];
  checklist: ChecklistItem[];
  links: LinkItem[];
  createdAt: string;
  updatedAt: string;
  updatedBy?: number;
  images: TaskDetailImage[];
  attachments: TaskDetailAttachment[];
}

export interface UpdateTaskDetailDto {
  description?: string;
  figmaUrl?: string;
  figmaEmbedKey?: string;
  estimatedHours?: string;
  actualHours?: string;
  difficulty?: TaskDifficulty;
  progress?: number;
  tags?: string[];
  checklist?: ChecklistItem[];
  links?: LinkItem[];
}

// 난이도 표시 설정
export const taskDifficultyConfig: Record<
  TaskDifficulty,
  { label: string; color: string }
> = {
  easy: { label: "쉬움", color: "text-green-600" },
  medium: { label: "중간", color: "text-yellow-600" },
  hard: { label: "어려움", color: "text-red-600" },
};
