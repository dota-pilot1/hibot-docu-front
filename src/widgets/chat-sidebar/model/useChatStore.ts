import { Store, useStore } from "@tanstack/react-store";

export interface ChatTab {
  id: number;
  title: string;
  isDirty: boolean;
}

export interface ChatPanel {
  id: string;
  tabs: ChatTab[];
  activeTabId: number | null;
  width: number;
}

const DEFAULT_PANEL_ID = "chat-panel-1";

const createDefaultPanel = (): ChatPanel => ({
  id: DEFAULT_PANEL_ID,
  tabs: [],
  activeTabId: null,
  width: 1,
});

export interface ChatStoreState {
  // 사이드바
  isOpen: boolean;
  sidebarWidth: number;
  expandedProjects: Set<number>;

  // 패널/탭
  panels: ChatPanel[];
  activePanelId: string;

  // 사이드바 액션
  toggle: () => void;
  setSidebarWidth: (width: number) => void;
  toggleProject: (projectId: number) => void;

  // 패널 액션
  addPanel: () => void;
  removePanel: (panelId: string) => void;
  setActivePanel: (panelId: string) => void;
  setPanelWidths: (
    leftPanelId: string,
    rightPanelId: string,
    leftWidth: number,
    rightWidth: number,
  ) => void;

  // 탭 액션
  openTab: (team: { id: number; title: string }) => void;
  closeTab: (teamId: number) => void;
  setActiveTab: (teamId: number) => void;
  updateTabTitle: (teamId: number, title: string) => void;
  setTabDirty: (teamId: number, isDirty: boolean) => void;

  // 탭 드래그
  reorderTabs: (panelId: string, fromIndex: number, toIndex: number) => void;
  moveTabToPanel: (
    fromPanelId: string,
    toPanelId: string,
    tabId: number,
    toIndex?: number,
  ) => void;
  addPanelWithTab: (
    fromPanelId: string,
    tabId: number,
    targetPanelId: string,
  ) => void;
}

const STORAGE_KEY = "chat-sidebar-storage";

let panelIdCounter = 1;
const generatePanelId = () => `chat-panel-${++panelIdCounter}`;

const loadPersistedState = (): {
  isOpen: boolean;
  sidebarWidth: number;
  expandedProjects: number[];
  panels: ChatPanel[];
  activePanelId: string;
} => {
  const defaultState = {
    isOpen: true,
    sidebarWidth: 256,
    expandedProjects: [] as number[],
    panels: [createDefaultPanel()],
    activePanelId: DEFAULT_PANEL_ID,
  };

  if (typeof window === "undefined") return defaultState;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);

      const storedPanels = parsed.panels;
      const panels =
        Array.isArray(storedPanels) && storedPanels.length > 0
          ? storedPanels
          : [createDefaultPanel()];

      const maxPanelNum = panels.reduce((max: number, p: ChatPanel) => {
        const match = p.id.match(/chat-panel-(\d+)/);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
      }, 1);
      panelIdCounter = maxPanelNum;

      return {
        isOpen: parsed.isOpen ?? true,
        sidebarWidth: parsed.sidebarWidth ?? 256,
        expandedProjects: parsed.expandedProjects ?? [],
        panels,
        activePanelId: parsed.activePanelId ?? panels[0].id,
      };
    }
  } catch (e) {
    console.error("Failed to load chat sidebar state", e);
  }
  return defaultState;
};

const persistedState = loadPersistedState();

export const chatStore = new Store<ChatStoreState>({
  isOpen: persistedState.isOpen,
  sidebarWidth: persistedState.sidebarWidth,
  expandedProjects: new Set(persistedState.expandedProjects),
  panels: persistedState.panels,
  activePanelId: persistedState.activePanelId,

  toggle: () => {
    chatStore.setState((state) => ({ ...state, isOpen: !state.isOpen }));
  },

  setSidebarWidth: (width: number) => {
    chatStore.setState((state) => ({ ...state, sidebarWidth: width }));
  },

  toggleProject: (projectId: number) => {
    chatStore.setState((state) => {
      const newExpanded = new Set(state.expandedProjects);
      if (newExpanded.has(projectId)) {
        newExpanded.delete(projectId);
      } else {
        newExpanded.add(projectId);
      }
      return { ...state, expandedProjects: newExpanded };
    });
  },

  addPanel: () => {
    chatStore.setState((state) => {
      const newPanelId = generatePanelId();
      const activePanelIndex = state.panels.findIndex(
        (p) => p.id === state.activePanelId,
      );
      const insertIndex = activePanelIndex + 1;

      const newPanel: ChatPanel = {
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

  removePanel: (panelId: string) => {
    chatStore.setState((state) => {
      if (state.panels.length <= 1) return state;

      const panelIndex = state.panels.findIndex((p) => p.id === panelId);
      if (panelIndex === -1) return state;

      const closingPanel = state.panels[panelIndex];
      const leftPanelIndex = panelIndex - 1;
      const targetPanelIndex =
        leftPanelIndex >= 0 ? leftPanelIndex : panelIndex + 1;
      const targetPanel = state.panels[targetPanelIndex];

      if (!targetPanel) return state;

      const newTargetTabs = [...targetPanel.tabs, ...closingPanel.tabs];
      const newPanels = state.panels
        .filter((p) => p.id !== panelId)
        .map((p) =>
          p.id === targetPanel.id ? { ...p, tabs: newTargetTabs } : p,
        );

      let newActivePanelId = state.activePanelId;
      if (state.activePanelId === panelId) {
        newActivePanelId = targetPanel.id;
      }

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
      };
    });
  },

  setActivePanel: (panelId: string) => {
    chatStore.setState((state) => ({
      ...state,
      activePanelId: panelId,
    }));
  },

  setPanelWidths: (
    leftPanelId: string,
    rightPanelId: string,
    leftWidth: number,
    rightWidth: number,
  ) => {
    chatStore.setState((state) => {
      const newPanels = state.panels.map((panel) => {
        if (panel.id === leftPanelId) return { ...panel, width: leftWidth };
        if (panel.id === rightPanelId) return { ...panel, width: rightWidth };
        return panel;
      });
      return { ...state, panels: newPanels };
    });
  },

  openTab: (team: { id: number; title: string }) => {
    chatStore.setState((state) => {
      // 모든 패널에서 이미 열린 탭 찾기
      for (let i = 0; i < state.panels.length; i++) {
        const panel = state.panels[i];
        const existingTab = panel.tabs.find((t) => t.id === team.id);
        if (existingTab) {
          // 해당 패널과 탭을 활성화
          const newPanels = [...state.panels];
          newPanels[i] = { ...panel, activeTabId: team.id };
          return { ...state, panels: newPanels, activePanelId: panel.id };
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
        tabs: [
          ...panel.tabs,
          { id: team.id, title: team.title, isDirty: false },
        ],
        activeTabId: team.id,
      };

      return { ...state, panels: newPanels };
    });
  },

  closeTab: (teamId: number) => {
    chatStore.setState((state) => {
      const panelIndex = state.panels.findIndex(
        (p) => p.id === state.activePanelId,
      );
      if (panelIndex === -1) return state;

      const panel = state.panels[panelIndex];
      const newTabs = panel.tabs.filter((t) => t.id !== teamId);

      let newActiveTabId = panel.activeTabId;
      if (panel.activeTabId === teamId) {
        const closedIndex = panel.tabs.findIndex((t) => t.id === teamId);
        if (newTabs.length > 0) {
          const newIndex = Math.min(closedIndex, newTabs.length - 1);
          newActiveTabId = newTabs[newIndex].id;
        } else {
          newActiveTabId = null;
        }
      }

      const newPanels = [...state.panels];
      newPanels[panelIndex] = {
        ...panel,
        tabs: newTabs,
        activeTabId: newActiveTabId,
      };

      return { ...state, panels: newPanels };
    });
  },

  setActiveTab: (teamId: number) => {
    chatStore.setState((state) => {
      const panelIndex = state.panels.findIndex(
        (p) => p.id === state.activePanelId,
      );
      if (panelIndex === -1) return state;

      const panel = state.panels[panelIndex];
      const newPanels = [...state.panels];
      newPanels[panelIndex] = { ...panel, activeTabId: teamId };

      return { ...state, panels: newPanels };
    });
  },

  updateTabTitle: (teamId: number, title: string) => {
    const currentState = chatStore.state;
    const tab = currentState.panels
      .flatMap((p) => p.tabs)
      .find((t) => t.id === teamId);
    if (!tab || tab.title === title) return;

    chatStore.setState((state) => ({
      ...state,
      panels: state.panels.map((panel) => ({
        ...panel,
        tabs: panel.tabs.map((t) => (t.id === teamId ? { ...t, title } : t)),
      })),
    }));
  },

  setTabDirty: (teamId: number, isDirty: boolean) => {
    const currentState = chatStore.state;
    const tab = currentState.panels
      .flatMap((p) => p.tabs)
      .find((t) => t.id === teamId);
    if (!tab || tab.isDirty === isDirty) return;

    chatStore.setState((state) => ({
      ...state,
      panels: state.panels.map((panel) => ({
        ...panel,
        tabs: panel.tabs.map((t) => (t.id === teamId ? { ...t, isDirty } : t)),
      })),
    }));
  },

  reorderTabs: (panelId: string, fromIndex: number, toIndex: number) => {
    chatStore.setState((state) => {
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

  moveTabToPanel: (
    fromPanelId: string,
    toPanelId: string,
    tabId: number,
    toIndex?: number,
  ) => {
    chatStore.setState((state) => {
      const fromPanelIndex = state.panels.findIndex(
        (p) => p.id === fromPanelId,
      );
      const toPanelIndex = state.panels.findIndex((p) => p.id === toPanelId);
      if (fromPanelIndex === -1 || toPanelIndex === -1) return state;

      const fromPanel = state.panels[fromPanelIndex];
      const toPanel = state.panels[toPanelIndex];

      const tabIndex = fromPanel.tabs.findIndex((t) => t.id === tabId);
      if (tabIndex === -1) return state;

      const movedTab = fromPanel.tabs[tabIndex];
      const newFromTabs = fromPanel.tabs.filter((t) => t.id !== tabId);

      const newToTabs = [...toPanel.tabs];
      if (toIndex !== undefined) {
        newToTabs.splice(toIndex, 0, movedTab);
      } else {
        newToTabs.push(movedTab);
      }

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
        activeTabId: tabId,
      };

      return {
        ...state,
        panels: newPanels,
        activePanelId: toPanelId,
      };
    });
  },

  addPanelWithTab: (
    fromPanelId: string,
    tabId: number,
    targetPanelId: string,
  ) => {
    chatStore.setState((state) => {
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

      const movedTab = fromPanel.tabs[tabIndex];
      const newFromTabs = fromPanel.tabs.filter((t) => t.id !== tabId);

      let newFromActiveTabId = fromPanel.activeTabId;
      if (fromPanel.activeTabId === tabId) {
        if (newFromTabs.length > 0) {
          const newIndex = Math.min(tabIndex, newFromTabs.length - 1);
          newFromActiveTabId = newFromTabs[newIndex].id;
        } else {
          newFromActiveTabId = null;
        }
      }

      const newPanelId = generatePanelId();
      const newPanel: ChatPanel = {
        id: newPanelId,
        tabs: [movedTab],
        activeTabId: tabId,
        width: 1,
      };

      const newPanels = [...state.panels];
      newPanels[fromPanelIndex] = {
        ...fromPanel,
        tabs: newFromTabs,
        activeTabId: newFromActiveTabId,
      };

      const insertIndex = targetPanelIndex + 1;
      newPanels.splice(insertIndex, 0, newPanel);

      return {
        ...state,
        panels: newPanels,
        activePanelId: newPanelId,
      };
    });
  },
});

if (typeof window !== "undefined") {
  chatStore.subscribe(() => {
    const state = chatStore.state;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        isOpen: state.isOpen,
        sidebarWidth: state.sidebarWidth,
        expandedProjects: Array.from(state.expandedProjects),
        panels: state.panels,
        activePanelId: state.activePanelId,
      }),
    );
  });
}

export const useChatStore = <T>(selector: (state: ChatStoreState) => T): T => {
  return useStore(chatStore, selector);
};
