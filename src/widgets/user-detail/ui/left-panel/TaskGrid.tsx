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
import { useQuery } from "@tanstack/react-query";

// AG Grid 모듈 등록
ModuleRegistry.registerModules([AllCommunityModule]);

import {
  Task,
  TaskStatus,
  TaskPriority,
  taskStatusConfig,
  taskPriorityConfig,
  taskApi,
  useBatchUpdateTasks,
  useBatchDeleteTasks,
} from "@/entities/task";
import { organizationApi } from "@/features/organization/api/organizationApi";
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
  userId?: number; // undefined면 전체 Task 조회
  filter?: string;
  currentTaskId?: number | null;
  showAssignee?: boolean; // 담당자 컬럼 표시 여부
  showIssueColumn?: boolean; // 이슈 컬럼 표시 여부
  sortByCreatedOnly?: boolean; // 생성일 역순으로만 정렬 (기본: false)
  onPendingChange?: (count: number) => void;
  onSelectionChange?: (count: number) => void;
  onTaskSelect?: (task: Task | null) => void; // 단일 Task 선택 시 콜백
  onIssueClick?: (task: Task) => void; // 이슈 컬럼 클릭 시 콜백
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

// 현재 작업 표시 셀 렌더러
const CurrentTaskCellRenderer = (props: {
  data: Task;
  currentTaskId?: number | null;
}) => {
  if (props.data?.id === props.currentTaskId) {
    return <span className="text-green-600 font-bold">✓</span>;
  }
  return null;
};

// 이슈 버튼 셀 렌더러
const IssueCellRenderer = (props: {
  data: Task;
  onIssueClick?: (task: Task) => void;
}) => {
  if (!props.data) return null;
  const issueCount = props.data.issueCount ?? 0;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        props.onIssueClick?.(props.data);
      }}
      className="px-2 py-0.5 text-xs border border-yellow-500 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
    >
      이슈 ({issueCount})
    </button>
  );
};

export const TaskGrid = forwardRef<TaskGridRef, TaskGridProps>(
  (
    {
      userId,
      filter = "all",
      currentTaskId,
      showAssignee = false,
      showIssueColumn = false,
      sortByCreatedOnly = false,
      onPendingChange,
      onSelectionChange,
      onTaskSelect,
      onIssueClick,
    },
    ref,
  ) => {
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

    // Task 목록 조회 (userId 있으면 유저별, 없으면 전체)
    const { data: tasks = [], isLoading } = useQuery({
      queryKey: userId ? ["tasks", "user", userId] : ["tasks", "all"],
      queryFn: () => (userId ? taskApi.getByUser(userId) : taskApi.getAll()),
    });

    // 유저 목록 조회 (담당자 표시용)
    const { data: users = [] } = useQuery({
      queryKey: ["users"],
      queryFn: () => organizationApi.getUsers(),
      enabled: showAssignee,
    });

    // 유저 ID -> 이름 맵
    const userMap = useMemo(() => {
      const map = new Map<number, string>();
      users.forEach((user) => {
        map.set(user.id, user.name || user.email.split("@")[0]);
      });
      return map;
    }, [users]);

    // 필터링 및 정렬된 Task 목록
    // 정렬 순서: sortByCreatedOnly가 true면 생성일 역순만, 아니면 1) 현재 작업 2) 진행중 3) 나머지 (생성일 역순)
    const filteredTasks = useMemo(() => {
      let result =
        filter === "all"
          ? tasks
          : tasks.filter((task) => task.status === filter);

      return [...result].sort((a, b) => {
        // 생성일 역순으로만 정렬
        if (sortByCreatedOnly) {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }

        // 현재 작업 우선
        if (a.isCurrent && !b.isCurrent) return -1;
        if (!a.isCurrent && b.isCurrent) return 1;

        // 진행중 우선
        if (a.status === "in_progress" && b.status !== "in_progress") return -1;
        if (a.status !== "in_progress" && b.status === "in_progress") return 1;

        // 나머지는 생성일 역순
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    }, [tasks, filter, sortByCreatedOnly]);

    // 배치 수정/삭제 훅
    const batchUpdateMutation = useBatchUpdateTasks();
    const batchDeleteMutation = useBatchDeleteTasks();

    // 모든 변경사항 저장
    const saveChanges = useCallback(async () => {
      if (pendingChanges.size === 0) return;
      const updates = Array.from(pendingChanges.entries()).map(
        ([id, data]) => ({
          id,
          data,
        }),
      );
      await batchUpdateMutation.mutateAsync(updates);
      setPendingChanges(new Map());
    }, [pendingChanges, batchUpdateMutation]);

    // 선택된 항목 삭제 (confirm 없이 바로 삭제 - 상위 컴포넌트에서 확인 다이얼로그 처리)
    const deleteSelected = useCallback(async () => {
      if (selectedIds.length === 0) return;

      await batchDeleteMutation.mutateAsync(selectedIds);
      setSelectedIds([]);
    }, [selectedIds, batchDeleteMutation]);

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

    const columnDefs = useMemo<ColDef<Task>[]>(() => {
      const cols: ColDef<Task>[] = [
        {
          field: "title",
          headerName: "제목",
          flex: 2,
          minWidth: 200,
          editable: true,
        },
      ];

      // 담당자 컬럼 (showAssignee가 true일 때만)
      if (showAssignee) {
        const assigneeOptions = [
          { value: "", label: "-" },
          ...users.map((user) => ({
            value: user.id,
            label: user.name || user.email.split("@")[0],
          })),
        ];

        cols.push({
          field: "assigneeId",
          headerName: "담당자",
          width: 120,
          editable: true,
          valueFormatter: (params) => userMap.get(params.value) || "-",
          cellEditor: SelectCellEditor,
          cellEditorParams: {
            options: assigneeOptions,
          },
        });
      }

      cols.push(
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
        {
          headerName: "",
          width: 50,
          cellRenderer: CurrentTaskCellRenderer,
          cellRendererParams: {
            currentTaskId,
          },
        },
      );

      // 이슈 컬럼 (showIssueColumn이 true일 때만)
      if (showIssueColumn) {
        cols.push({
          headerName: "이슈",
          width: 100,
          cellRenderer: IssueCellRenderer,
          cellRendererParams: {
            onIssueClick,
          },
        });
      }

      return cols;
    }, [
      currentTaskId,
      showAssignee,
      showIssueColumn,
      userMap,
      users,
      onIssueClick,
    ]);

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
          if (field === "assigneeId" && value) {
            value = Number(value);
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

      // 단일 선택 시 콜백 호출
      if (onTaskSelect) {
        onTaskSelect(selectedRows.length === 1 ? selectedRows[0] : null);
      }
    }, [onTaskSelect]);

    // 행 클릭 시 해당 Task 선택
    const handleRowClicked = useCallback(
      (event: { data: Task | undefined }) => {
        if (event.data && onTaskSelect) {
          onTaskSelect(event.data);
        }
      },
      [onTaskSelect],
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
          ref={gridRef}
          rowData={filteredTasks}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          animateRows={true}
          rowSelection={{
            mode: "multiRow",
            headerCheckbox: true,
            checkboxes: true,
            enableClickSelection: true,
          }}
          onCellValueChanged={handleCellValueChanged}
          onSelectionChanged={handleSelectionChanged}
          onRowClicked={handleRowClicked}
        />
      </div>
    );
  },
);

TaskGrid.displayName = "TaskGrid";
