"use client";

import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// AG Grid 모듈 등록
ModuleRegistry.registerModules([AllCommunityModule]);

import {
  Task,
  TaskStatus,
  TaskPriority,
  taskStatusConfig,
  taskPriorityConfig,
  taskApi,
} from "@/entities/task";

interface TaskGridProps {
  userId: number;
  onTaskSelect?: (task: Task | null) => void;
}

// 상태 셀 렌더러
const StatusCellRenderer = (props: { value: TaskStatus }) => {
  if (!props.value) return null;
  const config = taskStatusConfig[props.value];
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs ${config.bgColor} ${config.color}`}
    >
      {config.label}
    </span>
  );
};

// 우선순위 셀 렌더러
const PriorityCellRenderer = (props: { value: TaskPriority }) => {
  if (!props.value) return null;
  const config = taskPriorityConfig[props.value];
  return (
    <span className={`text-sm ${config.color}`}>
      {config.icon} {config.label}
    </span>
  );
};

export const TaskGrid = ({ userId, onTaskSelect }: TaskGridProps) => {
  const queryClient = useQueryClient();

  // Task 목록 조회
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", "user", userId],
    queryFn: () => taskApi.getByUser(userId),
  });

  // Task 수정 mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Task> }) =>
      taskApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", "user", userId] });
    },
  });

  const columnDefs = useMemo<ColDef<Task>[]>(
    () => [
      {
        field: "title",
        headerName: "제목",
        flex: 2,
        minWidth: 200,
        editable: true,
      },
      {
        field: "status",
        headerName: "상태",
        width: 100,
        cellRenderer: StatusCellRenderer,
      },
      {
        field: "priority",
        headerName: "우선순위",
        width: 110,
        cellRenderer: PriorityCellRenderer,
      },
      {
        field: "dueDate",
        headerName: "기한",
        width: 110,
        valueFormatter: (params) => {
          if (!params.value) return "-";
          return new Date(params.value).toLocaleDateString("ko-KR");
        },
      },
    ],
    [],
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      resizable: true,
    }),
    [],
  );

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center text-zinc-500">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="ag-theme-alpine h-full w-full">
      <AgGridReact<Task>
        rowData={tasks}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        animateRows={true}
        rowSelection="single"
        onRowClicked={(event) => {
          onTaskSelect?.(event.data || null);
        }}
        onCellValueChanged={(event) => {
          if (event.data && event.colDef.field) {
            updateTaskMutation.mutate({
              id: event.data.id,
              data: { [event.colDef.field]: event.newValue },
            });
          }
        }}
      />
    </div>
  );
};
