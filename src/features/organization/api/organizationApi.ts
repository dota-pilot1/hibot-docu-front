import { api } from "@/shared/api";

export interface OrganizationUser {
  id: number;
  email: string;
  name?: string;
  profileImage?: string | null;
  role: "ADMIN" | "USER";
  isActive?: boolean;
}

export const organizationApi = {
  getUsers: async (): Promise<OrganizationUser[]> => {
    const response = await api.get("/users");
    return response.data;
  },
};
