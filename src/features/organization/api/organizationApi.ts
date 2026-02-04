import { api } from "@/shared/api";

export interface OrganizationUser {
  id: number;
  email: string;
  name?: string;
  profileImage?: string | null;
  role: "ADMIN" | "USER";
  department?: {
    id: number;
    name: string;
  };
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  parentId: number | null;
  displayOrder: number;
  depth: number;
  children: Department[];
  users: OrganizationUser[];
}

export interface DepartmentTreeResponse {
  departments: Department[];
  unassignedUsers: OrganizationUser[];
}

export const organizationApi = {
  getUsers: async (): Promise<OrganizationUser[]> => {
    const response = await api.get("/users");
    return response.data;
  },

  getDepartmentTree: async (): Promise<DepartmentTreeResponse> => {
    const response = await api.get("/departments/tree");
    return response.data;
  },

  createDepartment: async (data: {
    name: string;
    description?: string;
    parentId?: number;
    displayOrder?: number;
  }): Promise<Department> => {
    const response = await api.post("/departments", data);
    return response.data;
  },

  updateDepartment: async (
    id: number,
    data: {
      name?: string;
      description?: string;
      parentId?: number;
      displayOrder?: number;
    },
  ): Promise<Department> => {
    const response = await api.patch(`/departments/${id}`, data);
    return response.data;
  },

  deleteDepartment: async (id: number): Promise<void> => {
    await api.delete(`/departments/${id}`);
  },

  updateUserDepartment: async (
    userId: number,
    departmentId: number | null,
  ): Promise<OrganizationUser> => {
    const response = await api.patch(`/users/${userId}/department`, {
      departmentId,
    });
    return response.data;
  },

  deleteUser: async (userId: number): Promise<void> => {
    await api.delete(`/users/${userId}`);
  },

  updateUserRole: async (
    userId: number,
    role: string,
  ): Promise<OrganizationUser> => {
    const response = await api.patch(`/users/${userId}/role`, { role });
    return response.data;
  },

  reorderUsers: async (
    userIds: number[],
    departmentId: number | null,
  ): Promise<void> => {
    await api.patch("/users/reorder", { userIds, departmentId });
  },

  reorderDepartments: async (
    departmentIds: number[],
    parentId: number | null,
  ): Promise<void> => {
    await api.patch("/departments/reorder", { departmentIds, parentId });
  },
};
