"use client";

import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, ModuleRegistry, AllCommunityModule } from "ag-grid-community";

// AG Grid 모듈 등록
ModuleRegistry.registerModules([AllCommunityModule]);
import {
  Task,
  TaskStatus,
  TaskPriority,
  taskStatusConfig,
  taskPriorityConfig,
} from "@/entities/task";

interface TaskGridProps {
  userId: number;
}

// 더미 데이터
const dummyTasks: Task[] = [
  {
    id: 1,
    title: "API 엔드포인트 개발",
    status: "in_progress",
    priority: "high",
    assigneeId: 1,
    dueDate: "2025-01-20",
    createdAt: "2025-01-15T09:00:00Z",
    updatedAt: "2025-01-15T09:00:00Z",
  },
  {
    id: 2,
    title: "프론트엔드 UI 수정",
    status: "pending",
    priority: "medium",
    assigneeId: 1,
    dueDate: "2025-01-22",
    createdAt: "2025-01-14T10:00:00Z",
    updatedAt: "2025-01-14T10:00:00Z",
  },
  {
    id: 3,
    title: "DB 스키마 설계",
    status: "completed",
    priority: "high",
    assigneeId: 1,
    dueDate: "2025-01-18",
    createdAt: "2025-01-10T08:00:00Z",
    updatedAt: "2025-01-18T17:00:00Z",
    completedAt: "2025-01-18T17:00:00Z",
  },
  {
    id: 4,
    title: "코드 리뷰",
    status: "review",
    priority: "medium",
    assigneeId: 1,
    dueDate: "2025-01-21",
    createdAt: "2025-01-16T11:00:00Z",
    updatedAt: "2025-01-16T11:00:00Z",
  },
  {
    id: 5,
    title: "버그 수정 - 로그인 오류",
    status: "blocked",
    priority: "high",
    assigneeId: 1,
    dueDate: "2025-01-19",
    createdAt: "2025-01-17T14:00:00Z",
    updatedAt: "2025-01-17T14:00:00Z",
  },
  {
    id: 6,
    title: "문서 작성",
    status: "pending",
    priority: "low",
    assigneeId: 1,
    dueDate: "2025-01-25",
    createdAt: "2025-01-15T15:00:00Z",
    updatedAt: "2025-01-15T15:00:00Z",
  },
];

// 상태 셀 렌더러
const StatusCellRenderer = (props: { value: TaskStatus }) => {
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
  const config = taskPriorityConfig[props.value];
  return (
    <span className={`text-sm ${config.color}`}>
      {config.icon} {config.label}
    </span>
  );
};

export const TaskGrid = ({ userId }: TaskGridProps) => {
  const columnDefs = useMemo<ColDef<Task>[]>(
    () => [
      {
        field: "title",
        headerName: "제목",
        flex: 2,
        minWidth: 200,
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

  return (
    <div className="ag-theme-alpine h-full w-full">
      <AgGridReact<Task>
        rowData={dummyTasks}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        animateRows={true}
        rowSelection="single"
        onRowClicked={(event) => {
          console.log("Row clicked:", event.data);
        }}
      />
    </div>
  );
};
