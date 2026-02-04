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
  TaskPriority,
  taskPriorityConfig,
  taskApi,
  useBatchUpdateTasks,
  useBatchDeleteTasks,
  useUpdateTaskStatus,
} from "@/entities/task";
import { organizationApi } from "@/features/organization/api/organizationApi";
import { DatePickerCellEditor } from "./editors/DatePickerCellEditor";
import { SelectCellEditor } from "./editors/SelectCellEditor";
import { TaskStatusButtons } from "./TaskStatusButtons";
import { TaskReviewDialog } from "./TaskReviewDialog";

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
  showDetailColumn?: boolean; // 상세 버튼 컬럼 표시 여부
  showCurrentTaskColumn?: boolean; // 현재 작업 설정 컬럼 표시 여부
  onPendingChange?: (count: number) => void;
  onSelectionChange?: (count: number) => void;
  onTaskSelect?: (task: Task | null) => void; // 단일 Task 선택 시 콜백
  onIssueClick?: (task: Task) => void; // 이슈 컬럼 클릭 시 콜백
  onDetailClick?: (task: Task) => void; // 상세 버튼 클릭 시 콜백
  onCurrentTaskChange?: (taskId: number) => void; // 현재 작업 변경 콜백
}

export interface TaskGridRef {
  saveChanges: () => Promise<void>;
  deleteSelected: () => Promise<void>;
  getPendingCount: () => number;
  getSelectedCount: () => number;
  getSelectedTask: () => Task | null;
}

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

// 진행 시작 토글 셀 렌더러

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

// 상세 버튼 셀 렌더러
const DetailCellRenderer = (props: {
  data: Task;
  onDetailClick?: (task: Task) => void;
}) => {
  if (!props.data) return null;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        props.onDetailClick?.(props.data);
      }}
      className="px-2 py-0.5 text-xs border border-blue-500 text-blue-600 hover:bg-blue-50 rounded transition-colors"
    >
      상세
    </button>
  );
};

// 현재 작업 체크 셀 렌더러
const CurrentTaskCheckRenderer = (props: {
  data: Task;
  currentTaskId?: number | null;
  onCurrentTaskChange?: (taskId: number) => void;
}) => {
  if (!props.data) return null;

  const isCurrent = props.data.id === props.currentTaskId;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (!isCurrent) {
          props.onCurrentTaskChange?.(props.data.id);
        }
      }}
      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
        isCurrent
          ? "bg-green-500 border-green-500 text-white"
          : "border-gray-300 hover:border-green-400"
      }`}
      title={isCurrent ? "현재 작업" : "현재 작업으로 설정"}
    >
      {isCurrent && <span className="text-xs font-bold">✓</span>}
    </button>
  );
};

// 남은 시간 셀 렌더러
const RemainingTimeCellRenderer = (props: { data: Task }) => {
  if (!props.data?.dueDate) return <span className="text-gray-400">-</span>;

  const now = new Date();
  const dueDate = new Date(props.data.dueDate);
  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (props.data.status === "completed") {
    return <span className="text-gray-400">완료</span>;
  }

  if (diffDays < 0) {
    return (
      <span className="text-red-600 font-medium">
        {Math.abs(diffDays)}일 초과
      </span>
    );
  } else if (diffDays === 0) {
    return <span className="text-orange-600 font-medium">오늘 마감</span>;
  } else if (diffDays <= 3) {
    return <span className="text-orange-500">{diffDays}일 남음</span>;
  } else {
    return <span className="text-gray-600">{diffDays}일 남음</span>;
  }
};

export const TaskGrid = forwardRef<TaskGridRef, TaskGridProps>(
  (
    {
      userId,
      filter = "all",
      currentTaskId,
      showAssignee = false,
      showIssueColumn = false,
      showDetailColumn = false,
      showCurrentTaskColumn = false,
      onPendingChange,
      onSelectionChange,
      onTaskSelect,
      onIssueClick,
      onDetailClick,
      onCurrentTaskChange,
    },
    ref,
  ) => {
    const gridRef = useRef<AgGridReact<Task>>(null);
    const [pendingChanges, setPendingChanges] = useState<
      Map<number, Partial<Task>>
    >(new Map());
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [selectedTaskForReview, setSelectedTaskForReview] =
      useState<Task | null>(null);

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

    // 필터링 및 정렬된 Task 목록 - 생성일 역순 (새 태스크가 맨 위)
    const filteredTasks = useMemo(() => {
      const result =
        filter === "all"
          ? tasks
          : tasks.filter((task) => task.status === filter);

      return [...result].sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    }, [tasks, filter]);

    // 배치 수정/삭제 훅
    const batchUpdateMutation = useBatchUpdateTasks();
    const batchDeleteMutation = useBatchDeleteTasks();
    const updateStatusMutation = useUpdateTaskStatus(userId);

    // 선택된 행의 변경사항만 저장
    const saveChanges = useCallback(async () => {
      if (selectedIds.length === 0) return;

      // 선택된 행 중 변경사항이 있는 것만 저장
      const updates = selectedIds
        .filter((id) => pendingChanges.has(id))
        .map((id) => ({
          id,
          data: pendingChanges.get(id)!,
        }));

      if (updates.length === 0) return;

      await batchUpdateMutation.mutateAsync(updates);

      // 저장된 항목만 pendingChanges에서 제거
      setPendingChanges((prev) => {
        const newMap = new Map(prev);
        updates.forEach(({ id }) => newMap.delete(id));
        return newMap;
      });

      // 선택 해제
      gridRef.current?.api.deselectAll();
    }, [selectedIds, pendingChanges, batchUpdateMutation]);

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

    const handleStatusChange = useCallback(
      (
        taskId: number,
        status: "pending" | "in_progress" | "blocked" | "review" | "completed",
      ) => {
        // 즉시 API 호출하여 상태 업데이트
        updateStatusMutation.mutate({ id: taskId, status });
      },
      [updateStatusMutation],
    );

    const handleHistoryClick = useCallback(
      (taskId: number) => {
        const task = tasks.find((t) => t.id === taskId);
        if (task) {
          setSelectedTaskForReview(task);
          setReviewDialogOpen(true);
        }
      },
      [tasks],
    );

    // TaskStatusButtons 셀 렌더러
    const TaskStatusButtonsRenderer = useCallback(
      (props: { data: Task | undefined }) => {
        if (!props.data) return null;
        return (
          <TaskStatusButtons
            task={props.data}
            onStatusChange={handleStatusChange}
            onHistoryClick={handleHistoryClick}
          />
        );
      },
      [handleStatusChange, handleHistoryClick],
    );

    const columnDefs = useMemo<ColDef<Task>[]>(() => {
      const cols: ColDef<Task>[] = [
        {
          field: "title",
          headerName: "제목",
          flex: 1,
          minWidth: 200,
          maxWidth: 500,
          editable: true,
          cellEditor: "agLargeTextCellEditor",
          cellEditorParams: {
            maxLength: 500,
            rows: 3,
            cols: 50,
          },
          wrapText: true,
          autoHeight: true,
        },
        {
          headerName: "상태",
          width: 320,
          cellRenderer: TaskStatusButtonsRenderer,
          cellStyle: {
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: "4px",
          },
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
          field: "priority",
          headerName: "우선순위",
          width: 100,
          editable: true,
          cellRenderer: PriorityCellRenderer,
          cellEditor: SelectCellEditor,
          cellEditorParams: {
            options: priorityOptions,
          },
        },
        {
          field: "startedAt",
          headerName: "시작일",
          width: 105,
          editable: true,
          cellEditor: DatePickerCellEditor,
          valueFormatter: (params) => {
            if (!params.value) return "-";
            return new Date(params.value).toLocaleDateString("ko-KR");
          },
        },
        {
          field: "dueDate",
          headerName: "기한",
          width: 105,
          editable: true,
          cellEditor: DatePickerCellEditor,
          valueFormatter: (params) => {
            if (!params.value) return "-";
            return new Date(params.value).toLocaleDateString("ko-KR");
          },
        },
        {
          headerName: "D-Day",
          width: 85,
          cellRenderer: RemainingTimeCellRenderer,
        },
      );

      // 이슈 컬럼 (showIssueColumn이 true일 때만)
      if (showIssueColumn) {
        cols.push({
          headerName: "",
          width: 85,
          cellRenderer: IssueCellRenderer,
          cellRendererParams: {
            onIssueClick,
          },
          cellStyle: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        });
      }

      // 상세 버튼 컬럼 (showDetailColumn이 true일 때만)
      if (showDetailColumn) {
        cols.push({
          headerName: "",
          width: 70,
          cellRenderer: DetailCellRenderer,
          cellRendererParams: {
            onDetailClick,
          },
          cellStyle: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        });
      }

      // 현재 작업 체크 컬럼 (showCurrentTaskColumn이 true일 때만)
      if (showCurrentTaskColumn) {
        cols.push({
          headerName: "",
          width: 50,
          cellRenderer: CurrentTaskCheckRenderer,
          cellRendererParams: {
            currentTaskId,
            onCurrentTaskChange,
          },
          cellStyle: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        });
      }

      return cols;
    }, [
      showAssignee,
      showIssueColumn,
      showDetailColumn,
      showCurrentTaskColumn,
      currentTaskId,
      userMap,
      users,
      onIssueClick,
      onDetailClick,
      onCurrentTaskChange,
      TaskStatusButtonsRenderer,
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
          if ((field === "dueDate" || field === "startedAt") && value) {
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

          // 수정된 행 자동 선택
          event.node.setSelected(true);
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

    // 수정된 행 스타일 적용
    const getRowClass = useCallback(
      (params: { data: Task | undefined }) => {
        if (params.data && pendingChanges.has(params.data.id)) {
          return "bg-yellow-50";
        }
        return "";
      },
      [pendingChanges],
    );

    if (isLoading) {
      return (
        <div className="h-full w-full flex items-center justify-center text-zinc-500">
          로딩 중...
        </div>
      );
    }

    return (
      <>
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
              enableClickSelection: false,
            }}
            getRowClass={getRowClass}
            onCellValueChanged={handleCellValueChanged}
            onSelectionChanged={handleSelectionChanged}
            onRowClicked={handleRowClicked}
          />
        </div>

        {/* 업무 리뷰 다이얼로그 */}
        {selectedTaskForReview && (
          <TaskReviewDialog
            open={reviewDialogOpen}
            onOpenChange={setReviewDialogOpen}
            taskId={selectedTaskForReview.id}
            taskTitle={selectedTaskForReview.title}
            currentStatus={selectedTaskForReview.status}
          />
        )}
      </>
    );
  },
);

TaskGrid.displayName = "TaskGrid";
