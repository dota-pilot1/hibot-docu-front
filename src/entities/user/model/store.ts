import { create } from 'zustand';
import { UserState, User } from './types';

export const useUserStore = create<UserState>((set) => ({
    user: null,
    setUser: (user: User | null) => set({ user }),
    logout: () => {
        localStorage.removeItem('access_token');
        set({ user: null });
    },
}));
