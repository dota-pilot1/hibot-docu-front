"use client";

import { useMemo, useState, useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  ModuleRegistry,
  AllCommunityModule,
  CellValueChangedEvent,
} from "ag-grid-community";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/shared/ui/button";
import { Save } from "lucide-react";

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
import { DatePickerCellEditor } from "./editors/DatePickerCellEditor";
import { SelectCellEditor } from "./editors/SelectCellEditor";

// 상태 옵션 (한글 라벨)
const statusOptions = Object.entries(taskStatusConfig).map(
  ([value, config]) => ({
    value,
    label: config.label,
  }),
);

// 우선순위 옵션 (한글 라벨)
const priorityOptions = Object.entries(taskPriorityConfig).map(
  ([value, config]) => ({
    value,
    label: `${config.icon} ${config.label}`,
  }),
);

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
  const gridRef = useRef<AgGridReact<Task>>(null);
  const [pendingChanges, setPendingChanges] = useState<
    Map<number, Partial<Task>>
  >(new Map());

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
      queryClient.invalidateQueries({ queryKey: ["activities", userId] });
    },
  });

  // 모든 변경사항 저장
  const handleSaveAll = useCallback(async () => {
    console.log("handleSaveAll called, pendingChanges:", pendingChanges);
    const promises = Array.from(pendingChanges.entries()).map(([id, data]) =>
      updateTaskMutation.mutateAsync({ id, data }),
    );
    await Promise.all(promises);
    setPendingChanges(new Map());
  }, [pendingChanges, updateTaskMutation]);

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
        width: 120,
        editable: true,
        cellRenderer: StatusCellRenderer,
        cellEditor: SelectCellEditor,
        cellEditorParams: {
          options: statusOptions,
        },
      },
      {
        field: "priority",
        headerName: "우선순위",
        width: 120,
        editable: true,
        cellRenderer: PriorityCellRenderer,
        cellEditor: SelectCellEditor,
        cellEditorParams: {
          options: priorityOptions,
        },
      },
      {
        field: "dueDate",
        headerName: "기한",
        width: 150,
        editable: true,
        cellEditor: DatePickerCellEditor,
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

  const handleCellValueChanged = useCallback(
    (event: CellValueChangedEvent<Task>) => {
      console.log(
        "handleCellValueChanged:",
        event.colDef.field,
        event.oldValue,
        "->",
        event.newValue,
      );
      if (event.data && event.colDef.field) {
        const taskId = event.data.id;
        const field = event.colDef.field as keyof Task;

        // dueDate의 경우 ISO 문자열로 변환
        let value = event.newValue;
        if (field === "dueDate" && value) {
          value = new Date(value).toISOString();
        }

        setPendingChanges((prev) => {
          const newMap = new Map(prev);
          const existing = newMap.get(taskId) || {};
          newMap.set(taskId, { ...existing, [field]: value });
          return newMap;
        });
      }
    },
    [],
  );

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center text-zinc-500">
        로딩 중...
      </div>
    );
  }

  const hasChanges = pendingChanges.size > 0;

  return (
    <div className="h-full w-full flex flex-col">
      {/* 저장 버튼 영역 */}
      <div className="flex justify-end p-2 border-b bg-zinc-50">
        <Button
          size="sm"
          onClick={handleSaveAll}
          disabled={!hasChanges || updateTaskMutation.isPending}
          className={hasChanges ? "bg-blue-600 hover:bg-blue-700" : ""}
        >
          <Save className="h-4 w-4 mr-1" />
          저장 {hasChanges && `(${pendingChanges.size})`}
        </Button>
      </div>

      {/* AG Grid */}
      <div className="ag-theme-alpine flex-1">
        <AgGridReact<Task>
          ref={gridRef}
          rowData={tasks}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          animateRows={true}
          rowSelection={{
            mode: "multiRow",
            headerCheckbox: true,
            checkboxes: true,
          }}
          onRowClicked={(event) => {
            onTaskSelect?.(event.data || null);
          }}
          onCellValueChanged={handleCellValueChanged}
        />
      </div>
    </div>
  );
};
