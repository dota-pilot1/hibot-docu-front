import { Store, useStore } from "@tanstack/react-store";

interface GlobalChatState {
  selectedRoomId: number | null;
  sidebarWidth: number;
}

const globalChatStore = new Store<GlobalChatState>({
  selectedRoomId: null,
  sidebarWidth: 280,
});

export const useGlobalChatStore = <T>(
  selector: (state: GlobalChatState) => T,
): T => {
  return useStore(globalChatStore, selector);
};

export const globalChatActions = {
  setSelectedRoomId: (roomId: number | null) => {
    globalChatStore.setState((state) => ({
      ...state,
      selectedRoomId: roomId,
    }));
  },

  setSidebarWidth: (width: number) => {
    globalChatStore.setState((state) => ({
      ...state,
      sidebarWidth: width,
    }));
  },
};
