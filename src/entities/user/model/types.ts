export interface User {
  userId: number;
  email: string;
  name?: string | null;
  role: "ADMIN" | "USER";
  profileImage?: string | null;
}

export interface UserState {
  user: User | null;
  accessToken: string | null;
  loginFocusTrigger: number;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  triggerLoginFocus: () => void;
  logout: () => void;
  hydrate: () => void;
}
