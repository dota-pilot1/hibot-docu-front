import { Store, useStore } from "@tanstack/react-store";

export interface SidebarState {
  isOpen: boolean;
  sidebarSize: number;
  toggle: () => void;
  open: () => void;
  close: () => void;
  setSidebarSize: (size: number) => void;
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
