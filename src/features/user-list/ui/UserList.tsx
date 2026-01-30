"use client";

import { useEffect, useState } from "react";
import { api } from "@/shared/api";
import { useUserStore } from "@/entities/user/model/store";
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
import { Trash2 } from "lucide-react";
import { AlertDialog } from "@/shared/ui/dialogs/AlertDialog";

interface User {
  id: number;
  email: string;
  role?: string;
}

export const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentUser = useUserStore((state) => state.user);
  const isAdmin = currentUser?.role === "ADMIN";

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setIsLoading(true);
    api
      .get("/users")
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load users");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;

    setIsDeleting(true);
    try {
      await api.delete(`/users/${deleteUserId}`);
      setUsers(users.filter((user) => user.id !== deleteUserId));
      setDeleteUserId(null);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <p className="text-center p-8">Loading users...</p>;
  if (error) return <p className="text-center p-8 text-destructive">{error}</p>;

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
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {user.role || "USER"}
                    </span>
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
        confirmText={isDeleting ? "삭제 중..." : "삭제"}
        cancelText="취소"
        disabled={isDeleting}
      />
    </>
  );
};
