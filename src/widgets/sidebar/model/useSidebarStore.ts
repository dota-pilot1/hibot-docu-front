import { Store, useStore } from "@tanstack/react-store";

export interface SidebarState {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

// Load persisted state from localStorage
const loadPersistedState = (): { isOpen: boolean } => {
  if (typeof window === "undefined") return { isOpen: true };
  try {
    const stored = localStorage.getItem("sidebar-storage");
    if (stored) {
      const parsed = JSON.parse(stored);
      return { isOpen: parsed.state?.isOpen ?? true };
    }
  } catch (e) {
    console.error("Failed to load sidebar state", e);
  }
  return { isOpen: true };
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
