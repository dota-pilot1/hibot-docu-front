import { api } from "@/shared/api";

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    name?: string;
    role: "ADMIN" | "USER";
    profileImage?: string;
  };
}

export interface UserProfile {
  id: number;
  email: string;
  name?: string;
  role: "ADMIN" | "USER";
  profileImage?: string;
}

export const authApi = {
  register: async (data: RegisterRequest): Promise<void> => {
    await api.post("/auth/register", data);
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get("/auth/profile");
    return response.data;
  },
};
