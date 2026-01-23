export interface User {
    userId: number;
    email: string;
}

export interface UserState {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
}
