"use client";

import { useUserStore } from "@/entities/user/model/store";
import { toast } from "sonner";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Trash2, Shield, User as UserIcon } from "lucide-react";
import { AlertDialog } from "@/shared/ui/dialogs/AlertDialog";
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

interface User {
  id: number;
  email: string;
  role?: string;
}

export const UserList = () => {
  const { data: users, isLoading, error } = useOrganizationUsers();
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const deleteUserMutation = useDeleteUser();
  const updateUserRoleMutation = useUpdateUserRole();

  const currentUser = useUserStore((state) => state.user);
  const isAdmin = currentUser?.role === "ADMIN";

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;

    try {
      await deleteUserMutation.mutateAsync(deleteUserId);
      setDeleteUserId(null);
      toast.success("사용자가 삭제되었습니다");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "사용자 삭제에 실패했습니다");
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await updateUserRoleMutation.mutateAsync({ userId, role: newRole });
      toast.success(`권한이 ${newRole}으로 변경되었습니다`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "권한 변경에 실패했습니다");
    }
  };

  if (isLoading) return <p className="text-center p-8">Loading users...</p>;
  if (error)
    return (
      <p className="text-center p-8 text-destructive">Failed to load users</p>
    );

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-2xl">Registered Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>
              A list of all users registered in the system.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-[120px]">Role</TableHead>
                {isAdmin && (
                  <TableHead className="w-[100px] text-right">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {isAdmin ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            disabled={updateUserRoleMutation.isPending}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-all duration-200 ${
                              updateUserRoleMutation.isPending
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            } ${
                              user.role === "ADMIN"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                            }`}
                          >
                            {user.role === "ADMIN" ? (
                              <Shield className="w-3 h-3" />
                            ) : (
                              <UserIcon className="w-3 h-3" />
                            )}
                            {user.role || "USER"}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.id, "USER")}
                            disabled={user.id === currentUser?.userId}
                          >
                            <UserIcon className="w-4 h-4 mr-2" />
                            USER
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.id, "ADMIN")}
                            disabled={user.id === currentUser?.userId}
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            ADMIN
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === "ADMIN"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                        }`}
                      >
                        {user.role === "ADMIN" ? (
                          <Shield className="w-3 h-3" />
                        ) : (
                          <UserIcon className="w-3 h-3" />
                        )}
                        {user.role || "USER"}
                      </span>
                    )}
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteUserId(user.id)}
                        disabled={user.id === currentUser?.userId}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog
        open={deleteUserId !== null}
        onOpenChange={(open) => !open && setDeleteUserId(null)}
        title="사용자 삭제"
        description={`정말로 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        variant="destructive"
        onConfirm={handleDeleteUser}
        confirmText={deleteUserMutation.isPending ? "삭제 중..." : "삭제"}
        cancelText="취소"
        disabled={deleteUserMutation.isPending}
      />
    </>
  );
};
