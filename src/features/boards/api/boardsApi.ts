import { api } from "@/shared/api";

export interface Board {
  id: number;
  code: string;
  name: string;
  description: string | null;
  boardType: "GENERAL" | "NOTICE" | "QNA" | "GALLERY";
  readPermission: string;
  writePermission: string;
  config: Record<string, any>;
  icon: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const boardsApi = {
  // 게시판 목록 조회
  getList: async (): Promise<Board[]> => {
    const response = await api.get("/boards");
    return response.data;
  },

  // 게시판 상세 조회 (code로)
  getByCode: async (code: string): Promise<Board> => {
    const response = await api.get(`/boards/${code}`);
    return response.data;
  },

  // 게시판 생성 (ADMIN)
  create: async (data: Partial<Board>): Promise<Board> => {
    const response = await api.post("/boards", data);
    return response.data;
  },

  // 게시판 수정 (ADMIN)
  update: async (id: number, data: Partial<Board>): Promise<Board> => {
    const response = await api.patch(`/boards/${id}`, data);
    return response.data;
  },

  // 게시판 삭제 (ADMIN)
  delete: async (id: number): Promise<void> => {
    await api.delete(`/boards/${id}`);
  },
};
