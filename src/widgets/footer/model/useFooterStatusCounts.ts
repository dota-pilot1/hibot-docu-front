import { useMemo } from "react";
import { useAllTasks, Task } from "@/entities/task";

interface StatusCounts {
  pending: number;
  inProgress: number;
  completed: number;
  delayed: number;
}

export const useFooterStatusCounts = (): StatusCounts => {
  const { data: tasks = [] } = useAllTasks();

  const statusCounts = useMemo(() => {
    return {
      pending: tasks.filter((t: Task) => t.status === "pending").length,
      inProgress: tasks.filter((t: Task) => t.status === "in_progress").length,
      completed: tasks.filter((t: Task) => t.status === "completed").length,
      delayed: tasks.filter((t: Task) => t.status === "blocked").length,
    };
  }, [tasks]);

  return statusCounts;
};
