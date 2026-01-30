"use client";

import { useOrganizationUsers } from "@/features/organization/model/useOrganization";
import { useSidebarStore } from "../model/useSidebarStore";
import { SidebarUserItem } from "./SidebarUserItem";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

interface SidebarUserListProps {
  searchQuery: string;
}

export const SidebarUserList = ({ searchQuery }: SidebarUserListProps) => {
  const isOpen = useSidebarStore((state) => state.isOpen);
  const { data: users, isLoading, error } = useOrganizationUsers();

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.email.toLowerCase().includes(query) ||
        user.name?.toLowerCase().includes(query),
    );
  }, [users, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-500">
        사용자 목록을 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-2 space-y-1">
        {filteredUsers.map((user) => (
          <SidebarUserItem key={user.id} user={user} collapsed={!isOpen} />
        ))}
        {filteredUsers.length === 0 && (
          <div className="p-4 text-sm text-zinc-500 text-center">
            사용자가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};
