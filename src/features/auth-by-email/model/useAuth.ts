import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, RegisterRequest, LoginRequest } from "../api/authApi";
import { userStore } from "@/entities/user/model/store";

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: () => {
      // 조직도 캐시 갱신 (새 사용자가 미배정에 표시되도록)
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      // 토큰 저장
      localStorage.setItem("token", response.access_token);

      // 유저 스토어 업데이트
      userStore.state.setUser(response.user);

      // 관련 캐시 갱신
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
};
