import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { boardsApi, Board } from "../api/boardsApi";

// 게시판 목록 조회
export function useBoards() {
  return useQuery({
    queryKey: ["boards"],
    queryFn: boardsApi.getList,
  });
}

// 게시판 상세 조회 (code로)
export function useBoard(code: string) {
  return useQuery({
    queryKey: ["board", code],
    queryFn: () => boardsApi.getByCode(code),
    enabled: !!code,
  });
}

// 게시판 생성
export function useCreateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Board>) => boardsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });
}

// 게시판 수정
export function useUpdateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Board> }) =>
      boardsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });
}

// 게시판 삭제
export function useDeleteBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => boardsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });
}
