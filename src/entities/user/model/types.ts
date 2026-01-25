export interface User {
    userId: number;
    email: string;
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
