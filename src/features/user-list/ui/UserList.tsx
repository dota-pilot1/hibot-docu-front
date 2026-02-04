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
import {
  Trash2,
  Shield,
  User as UserIcon,
  Loader2,
  List,
  LayoutGrid,
  Mail,
  Building2,
} from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Card, CardContent } from "@/shared/ui/card";

type ViewMode = "list" | "card";

export const UserList = () => {
  const { data: users, isLoading, error } = useOrganizationUsers();
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [deleteUserEmail, setDeleteUserEmail] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
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

  const handleSendMessage = (email: string) => {
    // TODO: 메시지 보내기 기능 구현
    toast.info(`${email}님에게 메시지 보내기 기능은 준비 중입니다`);
  };

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
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

  const RoleBadge = ({
    user,
    clickable = false,
  }: {
    user: { id: number; role: string };
    clickable?: boolean;
  }) => {
    const badge = (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
          clickable &&
          !(updateUserRoleMutation.isPending || user.id === currentUser?.userId)
            ? "cursor-pointer hover:opacity-80"
            : ""
        } ${
          updateUserRoleMutation.isPending || user.id === currentUser?.userId
            ? "opacity-50"
            : ""
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
      </span>
    );

    if (!clickable || !isAdmin) return badge;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            disabled={
              updateUserRoleMutation.isPending ||
              user.id === currentUser?.userId
            }
            className="focus:outline-none"
          >
            {badge}
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
    );
  };

  return (
    <>
      {/* 탭 - 카드 바깥 상단 */}
      <div className="mb-4">
        <Tabs
          value={viewMode}
          onValueChange={(v) => setViewMode(v as ViewMode)}
        >
          <TabsList className="h-9">
            <TabsTrigger value="list" className="gap-1.5 px-3">
              <List className="h-4 w-4" />
              리스트
            </TabsTrigger>
            <TabsTrigger value="card" className="gap-1.5 px-3">
              <LayoutGrid className="h-4 w-4" />
              카드
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg border shadow-sm">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b bg-slate-50 dark:bg-slate-800 rounded-t-lg">
          <div>
            <h2 className="text-xl font-semibold">사용자 관리</h2>
            <p className="text-sm text-muted-foreground mt-1">
              시스템에 등록된 사용자 목록입니다. 총 {users?.length || 0}명
            </p>
          </div>
        </div>

        {/* 리스트 뷰 */}
        {viewMode === "list" && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 dark:bg-slate-800/50">
                  <TableHead className="w-[80px] font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">이메일</TableHead>
                  <TableHead className="w-[160px] font-semibold">팀</TableHead>
                  <TableHead className="w-[140px] font-semibold">
                    권한
                  </TableHead>
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
                      {user.department ? (
                        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Building2 className="w-3.5 h-3.5" />
                          {user.department.name}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground/50">
                          미배정
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <RoleBadge user={user} clickable={isAdmin} />
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
        )}

        {/* 카드 뷰 */}
        {viewMode === "card" && (
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {users?.map((user) => (
                <Card
                  key={user.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center">
                      {/* 아바타 */}
                      <Avatar className="h-16 w-16 mb-3">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`}
                          alt={user.email}
                        />
                        <AvatarFallback className="text-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {getInitials(user.email)}
                        </AvatarFallback>
                      </Avatar>

                      {/* 이메일 */}
                      <p className="font-medium text-sm truncate w-full mb-1">
                        {user.email}
                      </p>

                      {/* 팀 정보 */}
                      <p className="text-xs text-muted-foreground mb-2 flex items-center justify-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {user.department?.name || "미배정"}
                      </p>

                      {/* 권한 배지 */}
                      <div className="mb-3">
                        <RoleBadge user={user} clickable={isAdmin} />
                      </div>

                      {/* 액션 버튼들 */}
                      <div className="flex gap-2 w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1.5"
                          onClick={() => handleSendMessage(user.email)}
                        >
                          <Mail className="h-3.5 w-3.5" />
                          메시지
                        </Button>
                        {isAdmin && user.id !== currentUser?.userId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeleteClick(user.id, user.email)
                            }
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

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
