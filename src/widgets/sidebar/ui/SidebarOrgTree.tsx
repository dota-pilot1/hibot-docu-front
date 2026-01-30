"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useDepartmentTree,
  useUpdateUserDepartment,
  useReorderUsers,
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

// 부서와 사용자 임시 상태를 위한 타입
interface TempDepartment extends Omit<Department, "children" | "users"> {
  children: TempDepartment[];
  users: OrganizationUser[];
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
  const reorderUsers = useReorderUsers();

  const [activeUser, setActiveUser] = useState<OrganizationUser | null>(null);
  const [activeDepartmentId, setActiveDepartmentId] = useState<number | null>(
    null,
  );

  // 드래그 중 임시 상태
  const [tempDepartments, setTempDepartments] = useState<
    TempDepartment[] | null
  >(null);
  const [tempUnassigned, setTempUnassigned] = useState<
    OrganizationUser[] | null
  >(null);

  // 실제 표시할 데이터 (드래그 중이면 임시 상태, 아니면 원본)
  const displayDepartments = tempDepartments ?? data?.departments ?? [];
  const displayUnassigned = tempUnassigned ?? data?.unassignedUsers ?? [];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  // 부서에서 사용자 목록 찾기
  const findUsersInDepartment = (
    departments: TempDepartment[],
    departmentId: number,
  ): OrganizationUser[] | null => {
    for (const dept of departments) {
      if (dept.id === departmentId) {
        return dept.users;
      }
      if (dept.children.length > 0) {
        const found = findUsersInDepartment(dept.children, departmentId);
        if (found) return found;
      }
    }
    return null;
  };

  // 부서 내 사용자 목록 교체
  const replaceUsersInDepartment = (
    departments: TempDepartment[],
    departmentId: number,
    newUsers: OrganizationUser[],
  ): TempDepartment[] => {
    return departments.map((dept) => {
      if (dept.id === departmentId) {
        return { ...dept, users: newUsers };
      }
      if (dept.children.length > 0) {
        return {
          ...dept,
          children: replaceUsersInDepartment(
            dept.children,
            departmentId,
            newUsers,
          ),
        };
      }
      return dept;
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === "user") {
      const user = active.data.current.user as OrganizationUser;
      const departmentId = active.data.current.departmentId as number | null;

      setActiveUser(user);
      setActiveDepartmentId(departmentId);

      // 임시 상태 초기화
      setTempDepartments(
        JSON.parse(JSON.stringify(data?.departments ?? [])) as TempDepartment[],
      );
      setTempUnassigned([...(data?.unassignedUsers ?? [])]);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !tempDepartments || active.id === over.id) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // 사용자 간 순서 변경만 처리
    if (activeData?.type === "user" && overData?.type === "user") {
      const activeDeptId = activeData.departmentId as number | null;
      const overDeptId = overData.departmentId as number | null;

      // 같은 부서/미배정 내에서만 순서 변경
      if (activeDeptId === overDeptId) {
        if (activeDeptId === null) {
          // 미배정 사용자 순서 변경
          if (!tempUnassigned) return;
          const oldIndex = tempUnassigned.findIndex((u) => u.id === active.id);
          const newIndex = tempUnassigned.findIndex((u) => u.id === over.id);
          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            setTempUnassigned(arrayMove(tempUnassigned, oldIndex, newIndex));
          }
        } else {
          // 부서 내 사용자 순서 변경
          const users = findUsersInDepartment(tempDepartments, activeDeptId);
          if (!users) return;
          const oldIndex = users.findIndex((u) => u.id === active.id);
          const newIndex = users.findIndex((u) => u.id === over.id);
          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            const newUsers = arrayMove(users, oldIndex, newIndex);
            setTempDepartments(
              replaceUsersInDepartment(tempDepartments, activeDeptId, newUsers),
            );
          }
        }
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    const currentActiveUser = activeUser;
    const currentActiveDeptId = activeDepartmentId;
    const currentTempDepartments = tempDepartments;
    const currentTempUnassigned = tempUnassigned;

    // 상태 초기화
    setActiveUser(null);
    setActiveDepartmentId(null);

    if (!over || !isAdmin || !currentActiveUser) {
      setTempDepartments(null);
      setTempUnassigned(null);
      return;
    }

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type === "user") {
      const userId = currentActiveUser.id;

      // 부서 이동
      if (overData?.type === "department") {
        setTempDepartments(null);
        setTempUnassigned(null);
        const departmentId = overData.department.id;
        updateUserDepartment.mutate({ userId, departmentId });
        return;
      }

      // 미배정으로 이동
      if (over.id === "unassigned") {
        setTempDepartments(null);
        setTempUnassigned(null);
        updateUserDepartment.mutate({ userId, departmentId: null });
        return;
      }

      // 같은 부서/미배정 내에서 순서 변경
      if (overData?.type === "user") {
        const overDeptId = overData.departmentId as number | null;

        if (currentActiveDeptId === overDeptId) {
          // 순서가 바뀌었으면 API 호출
          let userIds: number[] = [];

          if (currentActiveDeptId === null && currentTempUnassigned) {
            userIds = currentTempUnassigned.map((u) => u.id);
          } else if (currentActiveDeptId !== null && currentTempDepartments) {
            const users = findUsersInDepartment(
              currentTempDepartments,
              currentActiveDeptId,
            );
            if (users) {
              userIds = users.map((u) => u.id);
            }
          }

          if (userIds.length > 0) {
            try {
              await reorderUsers.mutateAsync({
                userIds,
                departmentId: currentActiveDeptId,
              });
            } catch (error) {
              console.error("Failed to reorder users:", error);
            }
          }
        }
      }
    }

    setTempDepartments(null);
    setTempUnassigned(null);
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

  const renderDepartment = (dept: TempDepartment): React.ReactNode => {
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
        department={dept as Department}
        collapsed={!isOpen}
        onAddSubDepartment={onAddSubDepartment}
      >
        {dept.children.map((child) => renderDepartment(child))}
        <SortableContext
          items={filteredUsers.map((u) => u.id)}
          strategy={verticalListSortingStrategy}
        >
          {filteredUsers.map((user) => (
            <SidebarUserItem
              key={user.id}
              user={user}
              departmentId={dept.id}
              collapsed={!isOpen}
              indent
              isDragDisabled={!isAdmin || !!searchQuery}
            />
          ))}
        </SortableContext>
      </SidebarDepartment>
    );
  };

  const filteredUnassigned = filterUsers(displayUnassigned);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-0.5">
          {displayDepartments.map((dept) =>
            renderDepartment(dept as TempDepartment),
          )}

          <UnassignedDropZone
            users={filteredUnassigned}
            isOpen={isOpen}
            isAdmin={isAdmin}
            searchQuery={searchQuery}
          />

          {displayDepartments.length === 0 &&
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
      <SortableContext
        items={users.map((u) => u.id)}
        strategy={verticalListSortingStrategy}
      >
        {users.map((user) => (
          <SidebarUserItem
            key={user.id}
            user={user}
            departmentId={null}
            collapsed={!isOpen}
            isDragDisabled={!isAdmin || !!searchQuery}
          />
        ))}
      </SortableContext>
    </div>
  );
};
