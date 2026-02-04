import axios from "axios";
import { userStore } from "@/entities/user/model/store";

// export const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });
// 삭제

if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

// Add a request interceptor to include the JWT token in all requests
api.interceptors.request.use((config) => {
  const token = userStore.state.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 로그인 불필요 페이지 (홈, 회원가입)
      const publicPaths = ["/", "/register"];
      const isPublicPage =
        typeof window !== "undefined" &&
        publicPaths.includes(window.location.pathname);

      // Clear state
      userStore.state.logout();

      if (typeof window !== "undefined" && !isPublicPage) {
        alert("로그인이 필요합니다. 메인 페이지로 이동합니다.");
        userStore.state.triggerLoginFocus();
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  },
);
