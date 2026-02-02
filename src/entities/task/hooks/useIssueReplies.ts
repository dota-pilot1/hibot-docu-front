import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskApi } from "../api/taskApi";
import { toast } from "sonner";

// 이슈 답변 목록 조회
export const useIssueReplies = (issueId: number | null) => {
  return useQuery({
    queryKey: ["issueReplies", issueId],
    queryFn: () => taskApi.getIssueReplies(issueId!),
    enabled: !!issueId,
  });
};

// 이슈 답변 생성
export const useCreateIssueReply = (issueId: number | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => taskApi.createIssueReply(issueId!, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issueReplies", issueId] });
      toast.success("답변이 등록되었습니다");
    },
    onError: () => {
      toast.error("답변 등록에 실패했습니다");
    },
  });
};

// 이슈 답변 수정
export const useUpdateIssueReply = (issueId: number | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ replyId, content }: { replyId: number; content: string }) =>
      taskApi.updateIssueReply(replyId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issueReplies", issueId] });
      toast.success("답변이 수정되었습니다");
    },
    onError: () => {
      toast.error("답변 수정에 실패했습니다");
    },
  });
};

// 이슈 답변 삭제
export const useDeleteIssueReply = (issueId: number | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (replyId: number) => taskApi.deleteIssueReply(replyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issueReplies", issueId] });
      toast.success("답변이 삭제되었습니다");
    },
    onError: () => {
      toast.error("답변 삭제에 실패했습니다");
    },
  });
};
