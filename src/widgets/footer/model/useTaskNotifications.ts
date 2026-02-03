import { useEffect, useState } from 'react';
import { useSocketIO } from '@/shared/hooks/useSocketIO';
import { useQueryClient } from '@tanstack/react-query';
import { taskKeys } from '@/entities/task';

interface TaskUpdatedPayload {
  taskId: number;
  title: string;
  status: 'pending' | 'in_progress' | 'blocked' | 'completed';
  previousStatus: string;
  updatedBy: string;
  updatedByName: string;
  updatedAt: string;
  assigneeId?: number;
}

export interface TaskNotification {
  id: string;
  type: 'task_updated' | 'task_created' | 'task_deleted';
  taskId: number;
  taskTitle: string;
  status: string;
  previousStatus: string;
  userName: string;
  timestamp: Date;
  message: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: '대기',
  in_progress: '진행',
  blocked: '막힘',
  completed: '완료',
};

function generateMessage(data: TaskUpdatedPayload, type: string): string {
  const to = STATUS_LABELS[data.status] || data.status;

  if (type === 'task_created') {
    return `${data.updatedByName}님이 "${data.title}" 업무를 생성했습니다`;
  }

  if (data.previousStatus) {
    const from = STATUS_LABELS[data.previousStatus] || data.previousStatus;
    return `${data.updatedByName}님이 "${data.title}" 업무를 ${from} → ${to}로 변경했습니다`;
  }

  return `${data.updatedByName}님이 "${data.title}" 업무를 업데이트했습니다`;
}

export const useTaskNotifications = () => {
  const [notifications, setNotifications] = useState<TaskNotification[]>([]);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const queryClient = useQueryClient();

  const { socket, isConnected } = useSocketIO('/tasks');

  useEffect(() => {
    if (!socket) return;

    const handleTaskUpdated = (data: TaskUpdatedPayload) => {
      console.log('[TaskNotifications] Received update:', data);

      // 새 알림 생성
      const newNotification: TaskNotification = {
        id: `${Date.now()}-${data.taskId}`,
        type: 'task_updated',
        taskId: data.taskId,
        taskTitle: data.title,
        status: data.status,
        previousStatus: data.previousStatus,
        userName: data.updatedByName,
        timestamp: new Date(data.updatedAt),
        message: generateMessage(data, 'task_updated'),
      };

      // 알림 목록에 추가 (최신 순, 최대 50개)
      setNotifications((prev) => [newNotification, ...prev].slice(0, 50));
      setHasNewNotifications(true);

      // React Query 캐시 무효화 (자동 리페치)
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    };

    const handleTaskCreated = (data: TaskUpdatedPayload) => {
      console.log('[TaskNotifications] Task created:', data);

      const newNotification: TaskNotification = {
        id: `${Date.now()}-${data.taskId}`,
        type: 'task_created',
        taskId: data.taskId,
        taskTitle: data.title,
        status: data.status,
        previousStatus: '',
        userName: data.updatedByName,
        timestamp: new Date(data.updatedAt),
        message: generateMessage(data, 'task_created'),
      };

      setNotifications((prev) => [newNotification, ...prev].slice(0, 50));
      setHasNewNotifications(true);

      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    };

    const handleTaskDeleted = (data: { taskId: number }) => {
      console.log('[TaskNotifications] Task deleted:', data);

      const newNotification: TaskNotification = {
        id: `${Date.now()}-${data.taskId}`,
        type: 'task_deleted',
        taskId: data.taskId,
        taskTitle: '삭제된 업무',
        status: '',
        previousStatus: '',
        userName: 'System',
        timestamp: new Date(),
        message: `업무가 삭제되었습니다`,
      };

      setNotifications((prev) => [newNotification, ...prev].slice(0, 50));
      setHasNewNotifications(true);

      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    };

    socket.on('taskUpdated', handleTaskUpdated);
    socket.on('taskCreated', handleTaskCreated);
    socket.on('taskDeleted', handleTaskDeleted);

    return () => {
      socket.off('taskUpdated', handleTaskUpdated);
      socket.off('taskCreated', handleTaskCreated);
      socket.off('taskDeleted', handleTaskDeleted);
    };
  }, [socket, queryClient]);

  const clearNewNotifications = () => {
    setHasNewNotifications(false);
  };

  return {
    notifications,
    hasNewNotifications,
    clearNewNotifications,
    isConnected,
  };
};
