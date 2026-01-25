import { Store } from '@tanstack/react-store';
import { useStore } from '@tanstack/react-store';
import { UserState, User } from './types';

// Define the initial state
const initialState: Omit<UserState, 'setUser' | 'setAccessToken' | 'triggerLoginFocus' | 'logout' | 'hydrate'> = {
    user: null,
    accessToken: null,
    loginFocusTrigger: 0,
};

// Internal function to load state from localStorage
const loadPersistedState = () => {
    if (typeof window === 'undefined') return initialState;
    try {
        const stored = localStorage.getItem('auth-storage');
        if (stored) {
            const parsed = JSON.parse(stored);
            return {
                user: parsed.state?.user || null,
                accessToken: parsed.state?.accessToken || null,
                loginFocusTrigger: 0, // Reset trigger on load
            };
        }
    } catch (e) {
        console.error('Failed to load persisted state', e);
    }
    return initialState;
};

// Create the core store
export const userStore = new Store<UserState>({
    ...loadPersistedState(),
    setUser: (user: User | null) => {
        userStore.setState((state) => ({ ...state, user }));
    },
    setAccessToken: (accessToken: string | null) => {
        userStore.setState((state) => ({ ...state, accessToken }));
    },
    triggerLoginFocus: () => {
        userStore.setState((state) => ({ ...state, loginFocusTrigger: state.loginFocusTrigger + 1 }));
    },
    logout: () => {
        userStore.setState((state) => ({ ...state, user: null, accessToken: null, loginFocusTrigger: 0 }));
    },
    hydrate: () => {
        userStore.setState((state) => ({ ...state, ...loadPersistedState() }));
    },
});

// Subscribe to changes to persist state
if (typeof window !== 'undefined') {
    userStore.subscribe(() => {
        const state = userStore.state;
        localStorage.setItem('auth-storage', JSON.stringify({
            state: {
                user: state.user,
                accessToken: state.accessToken,
            }
        }));
    });
}

// React hook for using the store
export const useUserStore = <T,>(selector: (state: UserState) => T): T => {
    return useStore(userStore, selector);
};

