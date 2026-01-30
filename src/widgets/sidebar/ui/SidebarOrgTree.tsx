"use client";

import { useState } from "react";
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
  CollisionDetection,
  pointerWithin,
  rectIntersection,
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
  useReorderDepartments,
} from "@/features/organization/model/useOrganization";
import { useSidebarStore } from "../model/useSidebarStore";
import { useUserStore } from "@/entities/user/model/store";
import { SidebarDepartment } from "./SidebarDepartment";
import { SidebarUserItem } from "./SidebarUserItem";
import { DragPreview } from "./DragPreview";
import { DepartmentDragPreview } from "./DepartmentDragPreview";
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
  const reorderDepartments = useReorderDepartments();

  // 드래그 중인 아이템
  const [activeUser, setActiveUser] = useState<OrganizationUser | null>(null);
  const [activeDepartment, setActiveDepartment] = useState<Department | null>(
    null,
  );
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

  // 커스텀 충돌 감지: 부서 드래그 시 부서만, 사용자 드래그 시 사용자/부서 감지
  const customCollisionDetection: CollisionDetection = (args) => {
    const { active } = args;
    const activeData = active.data.current;

    if (activeData?.type === "dept-sortable") {
      // 부서 드래그 시: dept- 로 시작하는 요소만 감지
      const collisions = rectIntersection(args);
      return collisions.filter((collision) => {
        const id = String(collision.id);
        return id.startsWith("dept-");
      });
    }

    // 사용자 드래그 시: 기본 closestCenter 사용
    return closestCenter(args);
  };

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

  // 부서의 형제 목록 찾기
  const findSiblingDepartments = (
    departments: TempDepartment[],
    targetId: number,
    parentId: number | null = null,
  ): { siblings: TempDepartment[]; parentId: number | null } | null => {
    for (const dept of departments) {
      if (dept.id === targetId) {
        return { siblings: departments, parentId };
      }
      if (dept.children.length > 0) {
        const found = findSiblingDepartments(dept.children, targetId, dept.id);
        if (found) return found;
      }
    }
    return null;
  };

  // 부서 형제 목록 교체
  const replaceSiblingDepartments = (
    departments: TempDepartment[],
    targetId: number,
    newSiblings: TempDepartment[],
  ): TempDepartment[] => {
    // 현재 레벨에서 찾으면 교체
    if (departments.some((d) => d.id === targetId)) {
      return newSiblings;
    }

    // 자식에서 찾기
    return departments.map((dept) => {
      if (dept.children.length > 0) {
        const found = dept.children.some((c) => c.id === targetId);
        if (found) {
          return { ...dept, children: newSiblings };
        }
        return {
          ...dept,
          children: replaceSiblingDepartments(
            dept.children,
            targetId,
            newSiblings,
          ),
        };
      }
      return dept;
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;

    // 임시 상태 초기화
    setTempDepartments(
      JSON.parse(JSON.stringify(data?.departments ?? [])) as TempDepartment[],
    );
    setTempUnassigned([...(data?.unassignedUsers ?? [])]);

    if (activeData?.type === "user") {
      const user = activeData.user as OrganizationUser;
      const departmentId = activeData.departmentId as number | null;
      setActiveUser(user);
      setActiveDepartmentId(departmentId);
      setActiveDepartment(null);
    } else if (activeData?.type === "dept-sortable") {
      const department = activeData.department as Department;
      setActiveDepartment(department);
      setActiveUser(null);
      setActiveDepartmentId(null);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !tempDepartments || active.id === over.id) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // 사용자 순서 변경
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

    // 부서 순서 변경
    if (
      activeData?.type === "dept-sortable" &&
      overData?.type === "dept-sortable"
    ) {
      const activeDept = activeData.department as Department;
      const overDept = overData.department as Department;

      // 같은 레벨(형제)인지 확인
      const activeResult = findSiblingDepartments(
        tempDepartments,
        activeDept.id,
      );
      const overResult = findSiblingDepartments(tempDepartments, overDept.id);

      if (
        activeResult &&
        overResult &&
        activeResult.parentId === overResult.parentId
      ) {
        const siblings = activeResult.siblings;
        const oldIndex = siblings.findIndex((d) => d.id === activeDept.id);
        const newIndex = siblings.findIndex((d) => d.id === overDept.id);

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const newSiblings = arrayMove(siblings, oldIndex, newIndex);
          setTempDepartments(
            replaceSiblingDepartments(
              tempDepartments,
              activeDept.id,
              newSiblings,
            ),
          );
        }
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    console.log("handleDragEnd", { active, over });

    const currentActiveUser = activeUser;
    const currentActiveDept = activeDepartment;
    const currentActiveDeptId = activeDepartmentId;
    const currentTempDepartments = tempDepartments;
    const currentTempUnassigned = tempUnassigned;

    // 상태 초기화
    setActiveUser(null);
    setActiveDepartment(null);
    setActiveDepartmentId(null);

    if (!over || !isAdmin) {
      console.log("Early return: no over or not admin", { over, isAdmin });
      setTempDepartments(null);
      setTempUnassigned(null);
      return;
    }

    const activeData = active.data.current;
    const overData = over.data.current;
    console.log("Data types", {
      activeType: activeData?.type,
      overType: overData?.type,
    });

    // 사용자 드래그 처리
    if (activeData?.type === "user" && currentActiveUser) {
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

    // 부서 드래그 처리
    console.log("Checking dept drag", {
      activeType: activeData?.type,
      currentActiveDept,
      currentTempDepartments: !!currentTempDepartments,
    });
    if (
      activeData?.type === "dept-sortable" &&
      currentActiveDept &&
      currentTempDepartments
    ) {
      console.log("Department drag detected", { overData, overId: over.id });

      // over.id에서 부서 ID 추출 (dept-{id} 형식)
      const overIdStr = String(over.id);
      let overDeptId: number | null = null;

      if (overData?.type === "dept-sortable" && overData.department) {
        overDeptId = (overData.department as Department).id;
      } else if (overIdStr.startsWith("dept-")) {
        overDeptId = parseInt(overIdStr.replace("dept-", ""), 10);
      }

      console.log("Over department ID", { overDeptId });

      if (overDeptId !== null) {
        const activeResult = findSiblingDepartments(
          currentTempDepartments,
          currentActiveDept.id,
        );
        const overResult = findSiblingDepartments(
          currentTempDepartments,
          overDeptId,
        );

        console.log("Sibling results", { activeResult, overResult });

        if (
          activeResult &&
          overResult &&
          activeResult.parentId === overResult.parentId
        ) {
          const departmentIds = activeResult.siblings.map((d) => d.id);
          console.log("Reordering departments", {
            departmentIds,
            parentId: activeResult.parentId,
          });
          try {
            await reorderDepartments.mutateAsync({
              departmentIds,
              parentId: activeResult.parentId,
            });
          } catch (error) {
            console.error("Failed to reorder departments:", error);
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

  // 같은 레벨의 부서 ID 목록 추출
  const getDepartmentIds = (departments: TempDepartment[]): string[] => {
    return departments.map((d) => `dept-${d.id}`);
  };

  const renderDepartment = (
    dept: TempDepartment,
    siblingIds: string[],
  ): React.ReactNode => {
    const filteredUsers = filterUsers(dept.users);
    const hasMatchingUsers = searchQuery ? filteredUsers.length > 0 : true;
    const hasMatchingChildren = dept.children.some((child) => {
      const childUsers = filterUsers(child.users);
      return childUsers.length > 0 || child.children.length > 0;
    });

    if (searchQuery && !hasMatchingUsers && !hasMatchingChildren) {
      return null;
    }

    const childSiblingIds = getDepartmentIds(dept.children);

    return (
      <SidebarDepartment
        key={dept.id}
        department={dept as Department}
        collapsed={!isOpen}
        onAddSubDepartment={onAddSubDepartment}
        isDragDisabled={!isAdmin || !!searchQuery}
      >
        <SortableContext
          items={childSiblingIds}
          strategy={verticalListSortingStrategy}
        >
          {dept.children.map((child) =>
            renderDepartment(child, childSiblingIds),
          )}
        </SortableContext>
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
  const rootDepartmentIds = getDepartmentIds(
    displayDepartments as TempDepartment[],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-0.5">
          <SortableContext
            items={rootDepartmentIds}
            strategy={verticalListSortingStrategy}
          >
            {(displayDepartments as TempDepartment[]).map((dept) =>
              renderDepartment(dept, rootDepartmentIds),
            )}
          </SortableContext>

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
        {activeDepartment && (
          <DepartmentDragPreview department={activeDepartment} />
        )}
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
