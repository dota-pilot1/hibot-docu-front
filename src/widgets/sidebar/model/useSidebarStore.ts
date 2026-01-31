import { Store, useStore } from "@tanstack/react-store";

export interface UserTab {
  id: number;
  email: string;
  name?: string;
  profileImage?: string | null;
}

export interface SidebarState {
  isOpen: boolean;
  sidebarSize: number;
  selectedUserId: number | null;
  tabs: UserTab[];
  activeTabId: number | null;
  toggle: () => void;
  open: () => void;
  close: () => void;
  setSidebarSize: (size: number) => void;
  selectUser: (userId: number | null) => void;
  openTab: (user: UserTab) => void;
  closeTab: (userId: number) => void;
  setActiveTab: (userId: number | null) => void;
}

// Load persisted state from localStorage
const loadPersistedState = (): { isOpen: boolean; sidebarSize: number } => {
  if (typeof window === "undefined") return { isOpen: true, sidebarSize: 256 };
  try {
    const stored = localStorage.getItem("sidebar-storage");
    if (stored) {
      const parsed = JSON.parse(stored);
      // 기존 % 값(20)이 저장되어 있으면 기본 px 값으로 변환
      const storedSize = parsed.state?.sidebarSize ?? 256;
      const sidebarSize = storedSize < 100 ? 256 : storedSize;
      return {
        isOpen: parsed.state?.isOpen ?? true,
        sidebarSize,
      };
    }
  } catch (e) {
    console.error("Failed to load sidebar state", e);
  }
  return { isOpen: true, sidebarSize: 256 };
};

// Create the sidebar store
export const sidebarStore = new Store<SidebarState>({
  ...loadPersistedState(),
  selectedUserId: null,
  tabs: [],
  activeTabId: null,
  toggle: () => {
    sidebarStore.setState((state) => ({ ...state, isOpen: !state.isOpen }));
  },
  open: () => {
    sidebarStore.setState((state) => ({ ...state, isOpen: true }));
  },
  close: () => {
    sidebarStore.setState((state) => ({ ...state, isOpen: false }));
  },
  setSidebarSize: (size: number) => {
    sidebarStore.setState((state) => ({ ...state, sidebarSize: size }));
  },
  selectUser: (userId: number | null) => {
    sidebarStore.setState((state) => ({ ...state, selectedUserId: userId }));
  },
  openTab: (user: UserTab) => {
    sidebarStore.setState((state) => {
      const existingTab = state.tabs.find((t) => t.id === user.id);
      if (existingTab) {
        return { ...state, activeTabId: user.id, selectedUserId: user.id };
      }
      return {
        ...state,
        tabs: [...state.tabs, user],
        activeTabId: user.id,
        selectedUserId: user.id,
      };
    });
  },
  closeTab: (userId: number) => {
    sidebarStore.setState((state) => {
      const newTabs = state.tabs.filter((t) => t.id !== userId);
      let newActiveTabId = state.activeTabId;
      let newSelectedUserId = state.selectedUserId;

      if (state.activeTabId === userId) {
        const closedIndex = state.tabs.findIndex((t) => t.id === userId);
        if (newTabs.length > 0) {
          const newIndex = Math.min(closedIndex, newTabs.length - 1);
          newActiveTabId = newTabs[newIndex].id;
          newSelectedUserId = newActiveTabId;
        } else {
          newActiveTabId = null;
          newSelectedUserId = null;
        }
      }

      return {
        ...state,
        tabs: newTabs,
        activeTabId: newActiveTabId,
        selectedUserId: newSelectedUserId,
      };
    });
  },
  setActiveTab: (userId: number | null) => {
    sidebarStore.setState((state) => ({
      ...state,
      activeTabId: userId,
      selectedUserId: userId,
    }));
  },
});

// Subscribe to changes to persist state
if (typeof window !== "undefined") {
  sidebarStore.subscribe(() => {
    const state = sidebarStore.state;
    localStorage.setItem(
      "sidebar-storage",
      JSON.stringify({
        state: {
          isOpen: state.isOpen,
          sidebarSize: state.sidebarSize,
        },
      }),
    );
  });
}

// React hook for using the sidebar store
export const useSidebarStore = <T>(selector: (state: SidebarState) => T): T => {
  return useStore(sidebarStore, selector);
};

// Export default hook for backward compatibility
export default function useSidebar() {
  const isOpen = useSidebarStore((state) => state.isOpen);
  const toggle = useSidebarStore((state) => state.toggle);
  const open = useSidebarStore((state) => state.open);
  const close = useSidebarStore((state) => state.close);

  return { isOpen, toggle, open, close };
}
