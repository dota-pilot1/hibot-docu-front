import { Store, useStore } from "@tanstack/react-store";

export interface UserTab {
  id: number;
  email: string;
  name?: string;
  profileImage?: string | null;
}

export interface Panel {
  id: string;
  tabs: UserTab[];
  activeTabId: number | null;
  width: number; // flex 비율 (기본 1)
}

const DEFAULT_PANEL_ID = "panel-1";

const createDefaultPanel = (): Panel => ({
  id: DEFAULT_PANEL_ID,
  tabs: [],
  activeTabId: null,
  width: 1,
});

export interface SidebarState {
  isOpen: boolean;
  sidebarSize: number;
  selectedUserId: number | null;
  panels: Panel[];
  activePanelId: string;
  toggle: () => void;
  open: () => void;
  close: () => void;
  setSidebarSize: (size: number) => void;
  selectUser: (userId: number | null) => void;
  // 패널 관련
  addPanel: () => void;
  removePanel: (panelId: string) => void;
  setActivePanel: (panelId: string) => void;
  // 탭 관련 (활성 패널 기준)
  openTab: (user: UserTab) => void;
  closeTab: (userId: number) => void;
  setActiveTab: (userId: number) => void;
  // 패널 리사이즈
  setPanelWidths: (
    leftPanelId: string,
    rightPanelId: string,
    leftWidth: number,
    rightWidth: number,
  ) => void;
  // 탭 드래그
  reorderTabs: (panelId: string, fromIndex: number, toIndex: number) => void;
  moveTabToPanel: (
    fromPanelId: string,
    toPanelId: string,
    tabId: number,
    toIndex?: number,
  ) => void;
  // 탭을 새 패널로 분할
  addPanelWithTab: (
    fromPanelId: string,
    tabId: number,
    targetPanelId: string,
  ) => void;
}

// Load persisted state from localStorage
const loadPersistedState = (): {
  isOpen: boolean;
  sidebarSize: number;
  panels: Panel[];
  activePanelId: string;
} => {
  const defaultState = {
    isOpen: true,
    sidebarSize: 256,
    panels: [createDefaultPanel()],
    activePanelId: DEFAULT_PANEL_ID,
  };

  if (typeof window === "undefined") return defaultState;

  try {
    const stored = localStorage.getItem("sidebar-storage");
    if (stored) {
      const parsed = JSON.parse(stored);
      const storedSize = parsed.state?.sidebarSize ?? 256;
      const sidebarSize = storedSize < 100 ? 256 : storedSize;

      // 패널 데이터 복원
      const storedPanels = parsed.state?.panels;
      const panels =
        Array.isArray(storedPanels) && storedPanels.length > 0
          ? storedPanels
          : [createDefaultPanel()];

      // panelIdCounter 복원 (중복 ID 방지)
      const maxPanelNum = panels.reduce((max: number, p: Panel) => {
        const match = p.id.match(/panel-(\d+)/);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
      }, 1);
      panelIdCounter = maxPanelNum;

      return {
        isOpen: parsed.state?.isOpen ?? true,
        sidebarSize,
        panels,
        activePanelId: parsed.state?.activePanelId ?? panels[0].id,
      };
    }
  } catch (e) {
    console.error("Failed to load sidebar state", e);
  }
  return defaultState;
};

// 고유 패널 ID 생성
let panelIdCounter = 1;
const generatePanelId = () => `panel-${++panelIdCounter}`;

// Create the sidebar store
const persistedState = loadPersistedState();
export const sidebarStore = new Store<SidebarState>({
  isOpen: persistedState.isOpen,
  sidebarSize: persistedState.sidebarSize,
  selectedUserId: null,
  panels: persistedState.panels,
  activePanelId: persistedState.activePanelId,

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

  // 패널 추가 (활성 패널 오른쪽에)
  addPanel: () => {
    sidebarStore.setState((state) => {
      const newPanelId = generatePanelId();
      const activePanelIndex = state.panels.findIndex(
        (p) => p.id === state.activePanelId,
      );
      const insertIndex = activePanelIndex + 1;

      const newPanel: Panel = {
        id: newPanelId,
        tabs: [],
        activeTabId: null,
        width: 1,
      };

      const newPanels = [
        ...state.panels.slice(0, insertIndex),
        newPanel,
        ...state.panels.slice(insertIndex),
      ];

      return {
        ...state,
        panels: newPanels,
        activePanelId: newPanelId,
      };
    });
  },

  // 패널 제거 (최소 1개 유지, 탭들은 왼쪽 패널로 이동)
  removePanel: (panelId: string) => {
    sidebarStore.setState((state) => {
      if (state.panels.length <= 1) return state;

      const panelIndex = state.panels.findIndex((p) => p.id === panelId);
      if (panelIndex === -1) return state;

      const closingPanel = state.panels[panelIndex];
      const leftPanelIndex = panelIndex - 1;

      // 왼쪽 패널이 있으면 거기로 탭 이동, 없으면 오른쪽 패널로
      const targetPanelIndex =
        leftPanelIndex >= 0 ? leftPanelIndex : panelIndex + 1;
      const targetPanel = state.panels[targetPanelIndex];

      if (!targetPanel) return state;

      // 닫히는 패널의 탭들을 타겟 패널에 추가
      const newTargetTabs = [...targetPanel.tabs, ...closingPanel.tabs];

      // 새 패널 배열 생성 (닫히는 패널 제외)
      const newPanels = state.panels
        .filter((p) => p.id !== panelId)
        .map((p) =>
          p.id === targetPanel.id ? { ...p, tabs: newTargetTabs } : p,
        );

      let newActivePanelId = state.activePanelId;
      let newSelectedUserId = state.selectedUserId;

      // 닫힌 패널이 활성 패널이었다면
      if (state.activePanelId === panelId) {
        newActivePanelId = targetPanel.id;
        // 닫힌 패널의 activeTab을 유지
        if (closingPanel.activeTabId) {
          newSelectedUserId = closingPanel.activeTabId;
        }
      }

      // 타겟 패널의 activeTabId 업데이트
      const updatedPanels = newPanels.map((p) => {
        if (p.id === targetPanel.id && closingPanel.activeTabId) {
          return { ...p, activeTabId: closingPanel.activeTabId };
        }
        return p;
      });

      return {
        ...state,
        panels: updatedPanels,
        activePanelId: newActivePanelId,
        selectedUserId: newSelectedUserId,
      };
    });
  },

  // 활성 패널 변경
  setActivePanel: (panelId: string) => {
    sidebarStore.setState((state) => ({
      ...state,
      activePanelId: panelId,
    }));
  },

  // 탭 열기 (모든 패널에서 이미 열린 탭 찾아서 활성화, 없으면 활성 패널에 추가)
  openTab: (user: UserTab) => {
    sidebarStore.setState((state) => {
      // 모든 패널에서 이미 열린 탭 찾기
      for (let i = 0; i < state.panels.length; i++) {
        const panel = state.panels[i];
        const existingTab = panel.tabs.find((t) => t.id === user.id);
        if (existingTab) {
          // 해당 패널과 탭을 활성화
          const newPanels = [...state.panels];
          newPanels[i] = { ...panel, activeTabId: user.id };
          return {
            ...state,
            panels: newPanels,
            activePanelId: panel.id,
            selectedUserId: user.id,
          };
        }
      }

      // 열린 탭이 없으면 현재 활성 패널에 새 탭 추가
      const panelIndex = state.panels.findIndex(
        (p) => p.id === state.activePanelId,
      );
      if (panelIndex === -1) return state;

      const panel = state.panels[panelIndex];
      const newPanels = [...state.panels];
      newPanels[panelIndex] = {
        ...panel,
        tabs: [...panel.tabs, user],
        activeTabId: user.id,
      };

      return {
        ...state,
        panels: newPanels,
        selectedUserId: user.id,
      };
    });
  },

  // 탭 닫기 (활성 패널에서)
  closeTab: (userId: number) => {
    sidebarStore.setState((state) => {
      const panelIndex = state.panels.findIndex(
        (p) => p.id === state.activePanelId,
      );
      if (panelIndex === -1) return state;

      const panel = state.panels[panelIndex];
      const newTabs = panel.tabs.filter((t) => t.id !== userId);

      let newActiveTabId = panel.activeTabId;
      let newSelectedUserId = state.selectedUserId;

      if (panel.activeTabId === userId) {
        const closedIndex = panel.tabs.findIndex((t) => t.id === userId);
        if (newTabs.length > 0) {
          const newIndex = Math.min(closedIndex, newTabs.length - 1);
          newActiveTabId = newTabs[newIndex].id;
          newSelectedUserId = newActiveTabId;
        } else {
          newActiveTabId = null;
          newSelectedUserId = null;
        }
      }

      const newPanels = [...state.panels];
      newPanels[panelIndex] = {
        ...panel,
        tabs: newTabs,
        activeTabId: newActiveTabId,
      };

      return {
        ...state,
        panels: newPanels,
        selectedUserId: newSelectedUserId,
      };
    });
  },

  // 탭 활성화 (활성 패널에서)
  setActiveTab: (userId: number) => {
    sidebarStore.setState((state) => {
      const panelIndex = state.panels.findIndex(
        (p) => p.id === state.activePanelId,
      );
      if (panelIndex === -1) return state;

      const panel = state.panels[panelIndex];
      const newPanels = [...state.panels];
      newPanels[panelIndex] = { ...panel, activeTabId: userId };

      return {
        ...state,
        panels: newPanels,
        selectedUserId: userId,
      };
    });
  },

  // 패널 너비 조정
  setPanelWidths: (
    leftPanelId: string,
    rightPanelId: string,
    leftWidth: number,
    rightWidth: number,
  ) => {
    sidebarStore.setState((state) => {
      const newPanels = state.panels.map((panel) => {
        if (panel.id === leftPanelId) {
          return { ...panel, width: leftWidth };
        }
        if (panel.id === rightPanelId) {
          return { ...panel, width: rightWidth };
        }
        return panel;
      });
      return { ...state, panels: newPanels };
    });
  },

  // 같은 패널 내 탭 순서 변경
  reorderTabs: (panelId: string, fromIndex: number, toIndex: number) => {
    sidebarStore.setState((state) => {
      const panelIndex = state.panels.findIndex((p) => p.id === panelId);
      if (panelIndex === -1) return state;

      const panel = state.panels[panelIndex];
      const newTabs = [...panel.tabs];
      const [movedTab] = newTabs.splice(fromIndex, 1);
      newTabs.splice(toIndex, 0, movedTab);

      const newPanels = [...state.panels];
      newPanels[panelIndex] = { ...panel, tabs: newTabs };

      return { ...state, panels: newPanels };
    });
  },

  // 다른 패널로 탭 이동
  moveTabToPanel: (
    fromPanelId: string,
    toPanelId: string,
    tabId: number,
    toIndex?: number,
  ) => {
    sidebarStore.setState((state) => {
      const fromPanelIndex = state.panels.findIndex(
        (p) => p.id === fromPanelId,
      );
      const toPanelIndex = state.panels.findIndex((p) => p.id === toPanelId);
      if (fromPanelIndex === -1 || toPanelIndex === -1) return state;

      const fromPanel = state.panels[fromPanelIndex];
      const toPanel = state.panels[toPanelIndex];

      const tabIndex = fromPanel.tabs.findIndex((t) => t.id === tabId);
      if (tabIndex === -1) return state;

      const [movedTab] = fromPanel.tabs.splice(tabIndex, 1);
      const newFromTabs = fromPanel.tabs.filter((t) => t.id !== tabId);

      // toPanel에 탭 추가
      const newToTabs = [...toPanel.tabs];
      if (toIndex !== undefined) {
        newToTabs.splice(toIndex, 0, movedTab);
      } else {
        newToTabs.push(movedTab);
      }

      // fromPanel의 activeTabId 처리
      let newFromActiveTabId = fromPanel.activeTabId;
      if (fromPanel.activeTabId === tabId) {
        if (newFromTabs.length > 0) {
          const newIndex = Math.min(tabIndex, newFromTabs.length - 1);
          newFromActiveTabId = newFromTabs[newIndex].id;
        } else {
          newFromActiveTabId = null;
        }
      }

      const newPanels = [...state.panels];
      newPanels[fromPanelIndex] = {
        ...fromPanel,
        tabs: newFromTabs,
        activeTabId: newFromActiveTabId,
      };
      newPanels[toPanelIndex] = {
        ...toPanel,
        tabs: newToTabs,
        activeTabId: tabId, // 이동된 탭 활성화
      };

      return {
        ...state,
        panels: newPanels,
        activePanelId: toPanelId, // 이동된 패널 활성화
        selectedUserId: tabId,
      };
    });
  },

  // 탭을 새 패널로 분할 (본문 영역에 드롭 시)
  addPanelWithTab: (
    fromPanelId: string,
    tabId: number,
    targetPanelId: string,
  ) => {
    sidebarStore.setState((state) => {
      const fromPanelIndex = state.panels.findIndex(
        (p) => p.id === fromPanelId,
      );
      const targetPanelIndex = state.panels.findIndex(
        (p) => p.id === targetPanelId,
      );
      if (fromPanelIndex === -1 || targetPanelIndex === -1) return state;

      const fromPanel = state.panels[fromPanelIndex];
      const tabIndex = fromPanel.tabs.findIndex((t) => t.id === tabId);
      if (tabIndex === -1) return state;

      // 탭 추출
      const movedTab = fromPanel.tabs[tabIndex];
      const newFromTabs = fromPanel.tabs.filter((t) => t.id !== tabId);

      // fromPanel의 activeTabId 처리
      let newFromActiveTabId = fromPanel.activeTabId;
      if (fromPanel.activeTabId === tabId) {
        if (newFromTabs.length > 0) {
          const newIndex = Math.min(tabIndex, newFromTabs.length - 1);
          newFromActiveTabId = newFromTabs[newIndex].id;
        } else {
          newFromActiveTabId = null;
        }
      }

      // 새 패널 생성 (타겟 패널 오른쪽에)
      const newPanelId = generatePanelId();
      const newPanel: Panel = {
        id: newPanelId,
        tabs: [movedTab],
        activeTabId: tabId,
        width: 1,
      };

      // 패널 배열 업데이트
      const newPanels = [...state.panels];
      newPanels[fromPanelIndex] = {
        ...fromPanel,
        tabs: newFromTabs,
        activeTabId: newFromActiveTabId,
      };

      // 새 패널을 타겟 패널 오른쪽에 삽입
      const insertIndex = targetPanelIndex + 1;
      newPanels.splice(insertIndex, 0, newPanel);

      return {
        ...state,
        panels: newPanels,
        activePanelId: newPanelId,
        selectedUserId: tabId,
      };
    });
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
          panels: state.panels,
          activePanelId: state.activePanelId,
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
