import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  organizationApi,
  OrganizationUser,
  DepartmentTreeResponse,
} from "../api/organizationApi";

export const useOrganizationUsers = () => {
  return useQuery<OrganizationUser[]>({
    queryKey: ["organization", "users"],
    queryFn: organizationApi.getUsers,
    staleTime: 1000 * 60 * 5,
  });
};

export const useDepartmentTree = () => {
  return useQuery<DepartmentTreeResponse>({
    queryKey: ["organization", "departments", "tree"],
    queryFn: organizationApi.getDepartmentTree,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: organizationApi.createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["organization", "departments"],
      });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Parameters<typeof organizationApi.updateDepartment>[1];
    }) => organizationApi.updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["organization", "departments"],
      });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: organizationApi.deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["organization", "departments"],
      });
    },
  });
};

export const useUpdateUserDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      departmentId,
    }: {
      userId: number;
      departmentId: number | null;
    }) => organizationApi.updateUserDepartment(userId, departmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => organizationApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["organization", "users"],
      });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) =>
      organizationApi.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["organization", "users"],
      });
    },
  });
};
