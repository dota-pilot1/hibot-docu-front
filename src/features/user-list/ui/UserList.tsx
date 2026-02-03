"use client";

import { useUserStore } from "@/entities/user/model/store";
import { toast } from "sonner";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import { Trash2, Shield, User as UserIcon, Loader2 } from "lucide-react";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  useOrganizationUsers,
  useDeleteUser,
  useUpdateUserRole,
} from "@/features/organization/model/useOrganization";

export const UserList = () => {
  const { data: users, isLoading, error } = useOrganizationUsers();
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [deleteUserEmail, setDeleteUserEmail] = useState<string>("");
  const deleteUserMutation = useDeleteUser();
  const updateUserRoleMutation = useUpdateUserRole();

  const currentUser = useUserStore((state) => state.user);
  const isAdmin = currentUser?.role === "ADMIN";

  const handleDeleteClick = (userId: number, email: string) => {
    setDeleteUserId(userId);
    setDeleteUserEmail(email);
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;

    try {
      await deleteUserMutation.mutateAsync(deleteUserId);
      setDeleteUserId(null);
      setDeleteUserEmail("");
      toast.success("사용자가 삭제되었습니다");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "사용자 삭제에 실패했습니다");
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await updateUserRoleMutation.mutateAsync({ userId, role: newRole });
      toast.success(
        `권한이 ${newRole === "ADMIN" ? "관리자" : "일반 사용자"}로 변경되었습니다`,
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || "권한 변경에 실패했습니다");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">
          사용자 목록을 불러오는데 실패했습니다
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-lg border shadow-sm">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b bg-slate-50 dark:bg-slate-800 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">사용자 관리</h2>
              <p className="text-sm text-muted-foreground mt-1">
                시스템에 등록된 사용자 목록입니다. 총 {users?.length || 0}명
              </p>
            </div>
          </div>
        </div>

        {/* 테이블 */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 dark:bg-slate-800/50">
                <TableHead className="w-[80px] font-semibold">ID</TableHead>
                <TableHead className="font-semibold">이메일</TableHead>
                <TableHead className="w-[140px] font-semibold">권한</TableHead>
                {isAdmin && (
                  <TableHead className="w-[80px] text-center font-semibold">
                    삭제
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow
                  key={user.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {user.id}
                  </TableCell>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    {isAdmin ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            disabled={
                              updateUserRoleMutation.isPending ||
                              user.id === currentUser?.userId
                            }
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                              updateUserRoleMutation.isPending ||
                              user.id === currentUser?.userId
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer hover:opacity-80"
                            } ${
                              user.role === "ADMIN"
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {user.role === "ADMIN" ? (
                              <Shield className="w-3.5 h-3.5" />
                            ) : (
                              <UserIcon className="w-3.5 h-3.5" />
                            )}
                            {user.role === "ADMIN" ? "관리자" : "사용자"}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.id, "USER")}
                            disabled={user.id === currentUser?.userId}
                          >
                            <UserIcon className="w-4 h-4 mr-2" />
                            일반 사용자
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.id, "ADMIN")}
                            disabled={user.id === currentUser?.userId}
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            관리자
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {user.role === "ADMIN" ? (
                          <Shield className="w-3.5 h-3.5" />
                        ) : (
                          <UserIcon className="w-3.5 h-3.5" />
                        )}
                        {user.role === "ADMIN" ? "관리자" : "사용자"}
                      </span>
                    )}
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(user.id, user.email)}
                        disabled={user.id === currentUser?.userId}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* 빈 상태 */}
        {(!users || users.length === 0) && (
          <div className="text-center py-12 text-muted-foreground">
            <UserIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>등록된 사용자가 없습니다</p>
          </div>
        )}
      </div>

      {/* 삭제 확인 다이어로그 */}
      <ConfirmDialog
        open={deleteUserId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteUserId(null);
            setDeleteUserEmail("");
          }
        }}
        title="사용자 삭제"
        description={`"${deleteUserEmail}" 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        variant="destructive"
        onConfirm={handleDeleteUser}
        confirmLabel="삭제"
        cancelLabel="취소"
        isLoading={deleteUserMutation.isPending}
      />
    </>
  );
};
