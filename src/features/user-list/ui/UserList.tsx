"use client";

import { useEffect, useState } from "react";
import { api } from "@/shared/api";
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

interface User {
  id: number;
  email: string;
}

export const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

  if (isLoading) return <p className="text-center p-8">Loading users...</p>;
  if (error) return <p className="text-center p-8 text-destructive">{error}</p>;

  return (
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.id}</TableCell>
                <TableCell>{user.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
