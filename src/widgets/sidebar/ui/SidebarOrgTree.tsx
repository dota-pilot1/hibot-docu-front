"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  useDepartmentTree,
  useUpdateUserDepartment,
} from "@/features/organization/model/useOrganization";
import { useSidebarStore } from "../model/useSidebarStore";
import { useUserStore } from "@/entities/user/model/store";
import { SidebarDepartment } from "./SidebarDepartment";
import { SidebarUserItem } from "./SidebarUserItem";
import { DragPreview } from "./DragPreview";
import { Loader2, Users } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/shared/lib/utils";
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
  const currentUser = useUserStore((state) => state.user);
  const isAdmin = currentUser?.role === "ADMIN";
  const { data, isLoading, error } = useDepartmentTree();
  const updateUserDepartment = useUpdateUserDepartment();
  const [activeUser, setActiveUser] = useState<OrganizationUser | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === "user") {
      setActiveUser(active.data.current.user);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveUser(null);

    if (!over || !isAdmin) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type === "user") {
      const userId = activeData.user.id;

      // 부서로 이동
      if (overData?.type === "department") {
        const departmentId = overData.department.id;
        updateUserDepartment.mutate({ userId, departmentId });
      }

      // 미배정으로 이동
      if (over.id === "unassigned") {
        updateUserDepartment.mutate({ userId, departmentId: null });
      }
    }
  };

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
            isDragDisabled={!isAdmin || !!searchQuery}
          />
        ))}
      </SidebarDepartment>
    );
  };

  const filteredUnassigned = filterUsers(data?.unassignedUsers || []);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-0.5">
          {data?.departments.map((dept) => renderDepartment(dept))}

          <UnassignedDropZone
            users={filteredUnassigned}
            isOpen={isOpen}
            isAdmin={isAdmin}
            searchQuery={searchQuery}
          />

          {data?.departments.length === 0 &&
            filteredUnassigned.length === 0 && (
              <div className="p-4 text-sm text-zinc-500 text-center">
                조직도가 비어있습니다.
              </div>
            )}
        </div>
      </div>

      <DragOverlay>
        {activeUser && <DragPreview user={activeUser} />}
      </DragOverlay>
    </DndContext>
  );
};

// 미배정 영역 드롭존
interface UnassignedDropZoneProps {
  users: OrganizationUser[];
  isOpen: boolean;
  isAdmin: boolean;
  searchQuery: string;
}

const UnassignedDropZone = ({
  users,
  isOpen,
  isAdmin,
  searchQuery,
}: UnassignedDropZoneProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: "unassigned",
    data: {
      type: "unassigned",
    },
  });

  if (users.length === 0 && !isOver) return null;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800",
        isOver && "bg-amber-50 dark:bg-amber-900/20 rounded-lg",
      )}
    >
      {isOpen && (
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 text-sm text-zinc-500 rounded-md",
            isOver && "bg-amber-100 dark:bg-amber-900/30",
          )}
        >
          <Users className="h-4 w-4" />
          <span>미배정</span>
          <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 rounded">
            {users.length}
          </span>
        </div>
      )}
      {users.map((user) => (
        <SidebarUserItem
          key={user.id}
          user={user}
          collapsed={!isOpen}
          isDragDisabled={!isAdmin || !!searchQuery}
        />
      ))}
    </div>
  );
};
