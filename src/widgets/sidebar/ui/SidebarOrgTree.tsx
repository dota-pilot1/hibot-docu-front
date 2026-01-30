"use client";

import { useDepartmentTree } from "@/features/organization/model/useOrganization";
import { useSidebarStore } from "../model/useSidebarStore";
import { SidebarDepartment } from "./SidebarDepartment";
import { SidebarUserItem } from "./SidebarUserItem";
import { Loader2, Users } from "lucide-react";
import type {
  Department,
  OrganizationUser,
} from "@/features/organization/api/organizationApi";

interface SidebarOrgTreeProps {
  searchQuery: string;
  onAddSubDepartment?: (parent: Department) => void;
}

export const SidebarOrgTree = ({
  searchQuery,
  onAddSubDepartment,
}: SidebarOrgTreeProps) => {
  const isOpen = useSidebarStore((state) => state.isOpen);
  const { data, isLoading, error } = useDepartmentTree();

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
        조직도를 불러올 수 없습니다.
      </div>
    );
  }

  const filterUsers = (users: OrganizationUser[]) => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.email.toLowerCase().includes(query) ||
        user.name?.toLowerCase().includes(query),
    );
  };

  const renderDepartment = (dept: Department): React.ReactNode => {
    const filteredUsers = filterUsers(dept.users);
    const hasMatchingUsers = searchQuery ? filteredUsers.length > 0 : true;
    const hasMatchingChildren = dept.children.some((child) => {
      const childUsers = filterUsers(child.users);
      return childUsers.length > 0 || child.children.length > 0;
    });

    if (searchQuery && !hasMatchingUsers && !hasMatchingChildren) {
      return null;
    }

    return (
      <SidebarDepartment
        key={dept.id}
        department={dept}
        collapsed={!isOpen}
        onAddSubDepartment={onAddSubDepartment}
      >
        {dept.children.map((child) => renderDepartment(child))}
        {filteredUsers.map((user) => (
          <SidebarUserItem
            key={user.id}
            user={user}
            collapsed={!isOpen}
            indent
          />
        ))}
      </SidebarDepartment>
    );
  };

  const filteredUnassigned = filterUsers(data?.unassignedUsers || []);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-2 space-y-0.5">
        {data?.departments.map((dept) => renderDepartment(dept))}

        {filteredUnassigned.length > 0 && (
          <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            {isOpen && (
              <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-zinc-500">
                <Users className="h-4 w-4" />
                <span>미배정</span>
                <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 rounded">
                  {filteredUnassigned.length}
                </span>
              </div>
            )}
            {filteredUnassigned.map((user) => (
              <SidebarUserItem key={user.id} user={user} collapsed={!isOpen} />
            ))}
          </div>
        )}

        {data?.departments.length === 0 && filteredUnassigned.length === 0 && (
          <div className="p-4 text-sm text-zinc-500 text-center">
            조직도가 비어있습니다.
          </div>
        )}
      </div>
    </div>
  );
};
