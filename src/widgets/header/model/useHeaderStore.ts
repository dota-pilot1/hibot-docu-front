import { Store, useStore } from "@tanstack/react-store";

export interface HeaderState {
  // 로그인 폼 저장 여부
  rememberCredentials: boolean;
  savedEmail: string;
  savedPassword: string;

  // 액션
  setRememberCredentials: (remember: boolean) => void;
  saveCredentials: (email: string, password: string) => void;
  clearCredentials: () => void;
}

const STORAGE_KEY = "header-storage";

const loadPersistedState = (): {
  rememberCredentials: boolean;
  savedEmail: string;
  savedPassword: string;
} => {
  const defaultState = {
    rememberCredentials: false,
    savedEmail: "",
    savedPassword: "",
  };

  if (typeof window === "undefined") return defaultState;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        rememberCredentials: parsed.rememberCredentials ?? false,
        savedEmail: parsed.savedEmail ?? "",
        savedPassword: parsed.savedPassword ?? "",
      };
    }
  } catch (e) {
    console.error("Failed to load header state", e);
  }
  return defaultState;
};

const persistedState = loadPersistedState();

export const headerStore = new Store<HeaderState>({
  rememberCredentials: persistedState.rememberCredentials,
  savedEmail: persistedState.savedEmail,
  savedPassword: persistedState.savedPassword,

  setRememberCredentials: (remember: boolean) => {
    headerStore.setState((state) => {
      if (!remember) {
        // 체크 해제 시 저장된 정보 삭제
        return {
          ...state,
          rememberCredentials: false,
          savedEmail: "",
          savedPassword: "",
        };
      }
      return { ...state, rememberCredentials: remember };
    });
  },

  saveCredentials: (email: string, password: string) => {
    headerStore.setState((state) => {
      if (state.rememberCredentials) {
        return { ...state, savedEmail: email, savedPassword: password };
      }
      return state;
    });
  },

  clearCredentials: () => {
    headerStore.setState((state) => ({
      ...state,
      savedEmail: "",
      savedPassword: "",
    }));
  },
});

if (typeof window !== "undefined") {
  headerStore.subscribe(() => {
    const state = headerStore.state;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        rememberCredentials: state.rememberCredentials,
        savedEmail: state.savedEmail,
        savedPassword: state.savedPassword,
      })
    );
  });
}

export const useHeaderStore = <T>(selector: (state: HeaderState) => T): T => {
  return useStore(headerStore, selector);
};
