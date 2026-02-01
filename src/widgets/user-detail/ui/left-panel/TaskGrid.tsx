"use client";

import {
  useMemo,
  useState,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  ModuleRegistry,
  AllCommunityModule,
  CellValueChangedEvent,
} from "ag-grid-community";
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
  filter?: string;
  onTaskSelect?: (task: Task | null) => void;
  onPendingChange?: (count: number) => void;
  onSelectionChange?: (count: number) => void;
}

export interface TaskGridRef {
  saveChanges: () => Promise<void>;
  deleteSelected: () => Promise<void>;
  getPendingCount: () => number;
  getSelectedCount: () => number;
  getSelectedTask: () => Task | null;
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

export const TaskGrid = forwardRef<TaskGridRef, TaskGridProps>(
  (
    {
      userId,
      filter = "all",
      onTaskSelect,
      onPendingChange,
      onSelectionChange,
    },
    ref,
  ) => {
    const queryClient = useQueryClient();
    const gridRef = useRef<AgGridReact<Task>>(null);
    const [pendingChanges, setPendingChanges] = useState<
      Map<number, Partial<Task>>
    >(new Map());
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // 부모에게 상태 변경 알림 (useEffect로 렌더링 후 호출)
    useEffect(() => {
      onPendingChange?.(pendingChanges.size);
    }, [pendingChanges.size, onPendingChange]);

    useEffect(() => {
      onSelectionChange?.(selectedIds.length);
    }, [selectedIds.length, onSelectionChange]);

    // Task 목록 조회
    const { data: tasks = [], isLoading } = useQuery({
      queryKey: ["tasks", "user", userId],
      queryFn: () => taskApi.getByUser(userId),
    });

    // 필터링된 Task 목록
    const filteredTasks = useMemo(() => {
      if (filter === "all") return tasks;
      return tasks.filter((task) => task.status === filter);
    }, [tasks, filter]);

    // Task 수정 mutation
    const updateTaskMutation = useMutation({
      mutationFn: ({ id, data }: { id: number; data: Partial<Task> }) =>
        taskApi.update(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["tasks", "user", userId] });
        queryClient.invalidateQueries({ queryKey: ["activities", userId] });
      },
    });

    // Task 삭제 mutation
    const deleteTaskMutation = useMutation({
      mutationFn: (id: number) => taskApi.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["tasks", "user", userId] });
      },
    });

    // 모든 변경사항 저장
    const saveChanges = useCallback(async () => {
      const promises = Array.from(pendingChanges.entries()).map(([id, data]) =>
        updateTaskMutation.mutateAsync({ id, data }),
      );
      await Promise.all(promises);
      setPendingChanges(new Map());
    }, [pendingChanges, updateTaskMutation]);

    // 선택된 항목 삭제
    const deleteSelected = useCallback(async () => {
      if (selectedIds.length === 0) return;
      if (!confirm(`${selectedIds.length}개의 Task를 삭제하시겠습니까?`))
        return;

      const promises = selectedIds.map((id) =>
        deleteTaskMutation.mutateAsync(id),
      );
      await Promise.all(promises);
      setSelectedIds([]);
    }, [selectedIds, deleteTaskMutation]);

    // 선택된 단일 Task 가져오기
    const getSelectedTask = useCallback((): Task | null => {
      const selectedRows = gridRef.current?.api.getSelectedRows() || [];
      if (selectedRows.length === 1) {
        return selectedRows[0];
      }
      return null;
    }, []);

    // 부모 컴포넌트에 메서드 노출
    useImperativeHandle(ref, () => ({
      saveChanges,
      deleteSelected,
      getPendingCount: () => pendingChanges.size,
      getSelectedCount: () => selectedIds.length,
      getSelectedTask,
    }));

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
        if (event.data && event.colDef.field) {
          const taskId = event.data.id;
          const field = event.colDef.field as keyof Task;

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

    const handleSelectionChanged = useCallback(() => {
      const selectedRows = gridRef.current?.api.getSelectedRows() || [];
      setSelectedIds(selectedRows.map((row) => row.id));
    }, []);

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
          ref={gridRef}
          rowData={filteredTasks}
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
          onSelectionChanged={handleSelectionChanged}
        />
      </div>
    );
  },
);

TaskGrid.displayName = "TaskGrid";
