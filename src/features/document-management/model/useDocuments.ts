import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  documentApi,
  FoldersWithDocumentsResponse,
  Document,
} from "../api/documentApi";

// 폴더 + 문서 목록 조회
export const useFoldersWithDocuments = () => {
  return useQuery<FoldersWithDocumentsResponse>({
    queryKey: ["documents", "folders"],
    queryFn: documentApi.getFoldersWithDocuments,
    staleTime: 1000 * 60 * 5,
  });
};

// 문서 상세 조회
export const useDocument = (id: number | null) => {
  return useQuery<Document>({
    queryKey: ["documents", "detail", id],
    queryFn: () => documentApi.getDocument(id!),
    enabled: id !== null,
    staleTime: 1000 * 60 * 5,
  });
};

// 폴더 생성
export const useCreateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: documentApi.createFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", "folders"] });
    },
  });
};

// 폴더 수정
export const useUpdateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string } }) =>
      documentApi.updateFolder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", "folders"] });
    },
  });
};

// 폴더 순서 변경
export const useReorderFolders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (folderIds: number[]) => documentApi.reorderFolders(folderIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", "folders"] });
    },
  });
};

// 폴더 삭제
export const useDeleteFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: documentApi.deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", "folders"] });
    },
  });
};

// 문서 생성
export const useCreateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: documentApi.createDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", "folders"] });
    },
  });
};

// 파일 업로드로 문서 생성
export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      folderId,
    }: {
      file: File;
      folderId?: number | null;
    }) => documentApi.uploadDocument(file, folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", "folders"] });
    },
  });
};

// 다중 파일 업로드
export const useUploadMultipleDocuments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      files,
      folderId,
    }: {
      files: File[];
      folderId?: number | null;
    }) => documentApi.uploadMultipleDocuments(files, folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", "folders"] });
    },
  });
};

// 문서 수정
export const useUpdateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { title?: string; content?: string };
    }) => documentApi.updateDocument(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documents", "folders"] });
      queryClient.invalidateQueries({
        queryKey: ["documents", "detail", variables.id],
      });
    },
  });
};

// 문서 삭제
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: documentApi.deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", "folders"] });
    },
  });
};

// 피그마 URL 추가
export const useCreateFigmaDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: documentApi.createFigmaDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", "folders"] });
    },
  });
};

// 문서 폴더 이동
export const useMoveDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, folderId }: { id: number; folderId: number | null }) =>
      documentApi.moveDocument(id, folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", "folders"] });
    },
  });
};
