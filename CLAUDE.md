# HiBot Docu Frontend - Development Guidelines

## Project Structure (FSD Architecture)

```
src/
├── app/           # Next.js App Router pages
├── entities/      # Business entities (task, user, etc.)
│   └── {entity}/
│       ├── api/       # API functions
│       ├── hooks/     # TanStack Query hooks
│       ├── model/     # Types and stores
│       └── index.ts   # Public exports
├── features/      # Feature modules
├── widgets/       # Complex UI components
└── shared/        # Shared utilities and UI components
```

## TanStack Query Hooks Guidelines

### 1. Hook Location
- Query/Mutation 훅은 `entities/{entity}/hooks/` 디렉토리에 위치
- 파일명: `use{Entity}s.ts` (예: `useTasks.ts`)

### 2. Query Keys
```typescript
// Query Keys를 상수로 정의하여 일관성 유지
export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  byUser: (userId: number) => [...taskKeys.all, "user", userId] as const,
  detail: (id: number) => [...taskKeys.all, "detail", id] as const,
};
```

### 3. Hook Naming Convention
- Query: `use{Entity}s`, `use{Entity}`, `use{Entity}Stats`
- Mutation: `useCreate{Entity}`, `useUpdate{Entity}`, `useDelete{Entity}`
- Batch: `useBatch{Action}{Entity}s`

### 4. Mutation Hook Pattern
```typescript
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskDto) => taskApi.create(data),
    onSuccess: () => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      // 성공 토스트
      toast.success("Task가 생성되었습니다.");
    },
    onError: () => {
      // 에러 토스트
      toast.error("Task 생성에 실패했습니다.");
    },
  });
};
```

### 5. Usage in Components
```typescript
// Good - 훅 사용
const createTaskMutation = useCreateTask();
createTaskMutation.mutate({ title: "새 Task", assigneeId: 1 });

// Bad - 컴포넌트 내 직접 정의
const createTaskMutation = useMutation({
  mutationFn: () => taskApi.create(...),
  ...
});
```

### 6. Export
```typescript
// entities/task/index.ts
export * from "./model/types";
export * from "./api/taskApi";
export * from "./hooks/useTasks";  // 훅도 함께 export
```

## UI Components

### Toast Messages
- 성공/에러 메시지는 훅 내부에서 처리
- `sonner` 라이브러리 사용
- 일관된 메시지 포맷 유지

### AG Grid
- 공통 컴포넌트: `TaskGrid`
- Props로 동작 커스터마이징 (`showAssignee`, `userId` 등)

## Code Style

### TypeScript
- 명시적 타입 정의
- `interface` 우선 사용

### Imports
- 절대 경로 (`@/`) 사용
- Entity에서 export된 것 사용 (`import { Task, useCreateTask } from "@/entities/task"`)
