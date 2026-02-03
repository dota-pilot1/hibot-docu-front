"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Users,
  User as UserIcon,
  Folder,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { api } from "@/shared/api";

interface User {
  id: number;
  name?: string;
  email: string;
  departmentId?: number;
  profileImage?: string;
}

interface Department {
  id: number;
  name: string;
  parentId?: number;
  depth: number;
}

interface SkillUserSidebarProps {
  selectedUserId?: number;
  onSelectUser: (user: User) => void;
  currentUserId?: number;
}

function DepartmentGroup({
  department,
  users,
  selectedUserId,
  onSelectUser,
  currentUserId,
  searchQuery,
}: {
  department: Department | null;
  users: User[];
  selectedUserId?: number;
  onSelectUser: (user: User) => void;
  currentUserId?: number;
  searchQuery: string;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const filteredUsers = searchQuery
    ? users.filter(
        (u) =>
          u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : users;

  if (filteredUsers.length === 0 && searchQuery) return null;

  return (
    <div className="mb-2">
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start px-2 py-1.5 h-auto"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <FolderOpen className="h-4 w-4 mr-2 text-amber-500" />
        ) : (
          <Folder className="h-4 w-4 mr-2 text-amber-500" />
        )}
        <span className="font-medium text-sm">
          {department?.name || "미배정"}
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          {filteredUsers.length}
        </span>
      </Button>

      {isExpanded && (
        <div className="ml-2 mt-1 space-y-0.5">
          {filteredUsers.map((user) => (
            <Button
              key={user.id}
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-start px-2 py-1.5 h-auto",
                selectedUserId === user.id && "bg-primary/10 text-primary",
              )}
              onClick={() => onSelectUser(user)}
            >
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mr-2 shrink-0">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt=""
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <UserIcon className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm truncate">
                  {user.name || user.email.split("@")[0]}
                </p>
                {user.id === currentUserId && (
                  <span className="text-xs text-primary">(나)</span>
                )}
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

export function SkillUserSidebar({
  selectedUserId,
  onSelectUser,
  currentUserId,
}: SkillUserSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // 부서 목록 조회
  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data } = await api.get<Department[]>("/departments");
      return data;
    },
  });

  // 사용자 목록 조회
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await api.get<User[]>("/users");
      return data;
    },
  });

  // 부서별로 사용자 그룹화
  const usersByDepartment = new Map<number | null, User[]>();

  users?.forEach((user) => {
    const deptId = user.departmentId ?? null;
    if (!usersByDepartment.has(deptId)) {
      usersByDepartment.set(deptId, []);
    }
    usersByDepartment.get(deptId)!.push(user);
  });

  // 부서 순서대로 정렬
  const sortedDepartments = departments?.sort((a, b) => a.id - b.id) || [];

  return (
    <div className="h-full flex flex-col border-r bg-background">
      {/* 헤더 */}
      <div className="p-3 border-b">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">스킬 관리</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="사용자 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      {/* 부서별 사용자 목록 */}
      <div className="flex-1 overflow-auto p-2">
        {sortedDepartments.map((dept) => {
          const deptUsers = usersByDepartment.get(dept.id) || [];
          if (deptUsers.length === 0) return null;

          return (
            <DepartmentGroup
              key={dept.id}
              department={dept}
              users={deptUsers}
              selectedUserId={selectedUserId}
              onSelectUser={onSelectUser}
              currentUserId={currentUserId}
              searchQuery={searchQuery}
            />
          );
        })}

        {/* 미배정 사용자 */}
        {usersByDepartment.get(null)?.length ? (
          <DepartmentGroup
            department={null}
            users={usersByDepartment.get(null) || []}
            selectedUserId={selectedUserId}
            onSelectUser={onSelectUser}
            currentUserId={currentUserId}
            searchQuery={searchQuery}
          />
        ) : null}
      </div>
    </div>
  );
}
