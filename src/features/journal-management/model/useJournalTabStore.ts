import { Store, useStore } from "@tanstack/react-store";
import type { Journal } from "../api/journalApi";

export interface JournalTab {
  id: string; // categoryId를 문자열로 사용
  categoryId: number;
  title: string;
  journals: Journal[];
}

export interface JournalPanel {
  id: string;
  tabs: JournalTab[];
  activeTabId: string | null;
  width: number;
}

export interface JournalTabStoreState {
  panels: JournalPanel[];
  activePanelId: string;

  openTab: (tab: { categoryId: number; title: string }) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTabJournals: (id: string, journals: Journal[]) => void;
  setActivePanel: (panelId: string) => void;
  addPanel: () => void;
  removePanel: (panelId: string) => void;
  setPanelWidths: (
    leftPanelId: string,
    rightPanelId: string,
    leftWidth: number,
    rightWidth: number,
  ) => void;
  reorderTabs: (panelId: string, fromIndex: number, toIndex: number) => void;
  moveTabToPanel: (
    fromPanelId: string,
    toPanelId: string,
    tabId: string,
    toIndex?: number,
  ) => void;
  addPanelWithTab: (
    fromPanelId: string,
    tabId: string,
    targetPanelId: string,
  ) => void;
}

const STORAGE_KEY = "journal-tabs-storage-v5";

const createPanelId = () =>
  `panel-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const loadPersistedState = (): {
  panels: JournalPanel[];
  activePanelId: string;
} => {
  const defaultPanel: JournalPanel = {
    id: createPanelId(),
    tabs: [],
    activeTabId: null,
    width: 1,
  };
  const defaultState = {
    panels: [defaultPanel],
    activePanelId: defaultPanel.id,
  };

  if (typeof window === "undefined") return defaultState;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.panels && parsed.panels.length > 0) {
        const migratedPanels = parsed.panels.map((p: JournalPanel) => ({
          ...p,
          width: p.width ?? 1 / parsed.panels.length,
        }));
        return {
          panels: migratedPanels,
          activePanelId: parsed.activePanelId ?? migratedPanels[0].id,
        };
      }
    }
  } catch (e) {
    console.error("Failed to load journal tabs state", e);
  }
  return defaultState;
};

const persistedState = loadPersistedState();

export const journalTabStore = new Store<JournalTabStoreState>({
  panels: persistedState.panels,
  activePanelId: persistedState.activePanelId,

  openTab: (tab: { categoryId: number; title: string }) => {
    journalTabStore.setState((state) => {
      const activePanel = state.panels.find(
        (p) => p.id === state.activePanelId,
      );
      if (!activePanel) return state;

      const tabId = String(tab.categoryId);

      // 이미 열려있는 탭인지 확인
      const existingTab = activePanel.tabs.find((t) => t.id === tabId);
      if (existingTab) {
        return {
          ...state,
          panels: state.panels.map((p) =>
            p.id === state.activePanelId ? { ...p, activeTabId: tabId } : p,
          ),
        };
      }

      // 새 탭 추가
      const newTab: JournalTab = {
        id: tabId,
        categoryId: tab.categoryId,
        title: tab.title,
        journals: [],
      };

      return {
        ...state,
        panels: state.panels.map((p) =>
          p.id === state.activePanelId
            ? {
                ...p,
                tabs: [...p.tabs, newTab],
                activeTabId: tabId,
              }
            : p,
        ),
      };
    });
  },

  closeTab: (id: string) => {
    journalTabStore.setState((state) => {
      const activePanel = state.panels.find(
        (p) => p.id === state.activePanelId,
      );
      if (!activePanel) return state;

      const newTabs = activePanel.tabs.filter((t) => t.id !== id);
      let newActiveTabId = activePanel.activeTabId;

      if (activePanel.activeTabId === id) {
        const closedIndex = activePanel.tabs.findIndex((t) => t.id === id);
        if (newTabs.length > 0) {
          const newIndex = Math.min(closedIndex, newTabs.length - 1);
          newActiveTabId = newTabs[newIndex].id;
        } else {
          newActiveTabId = null;
        }
      }

      return {
        ...state,
        panels: state.panels.map((p) =>
          p.id === state.activePanelId
            ? { ...p, tabs: newTabs, activeTabId: newActiveTabId }
            : p,
        ),
      };
    });
  },

  setActiveTab: (id: string) => {
    journalTabStore.setState((state) => ({
      ...state,
      panels: state.panels.map((p) =>
        p.id === state.activePanelId ? { ...p, activeTabId: id } : p,
      ),
    }));
  },

  updateTabJournals: (id: string, journals: Journal[]) => {
    journalTabStore.setState((state) => ({
      ...state,
      panels: state.panels.map((p) => ({
        ...p,
        tabs: p.tabs.map((t) => (t.id === id ? { ...t, journals } : t)),
      })),
    }));
  },

  setActivePanel: (panelId: string) => {
    journalTabStore.setState((state) => ({
      ...state,
      activePanelId: panelId,
    }));
  },

  addPanel: () => {
    journalTabStore.setState((state) => {
      const newPanel: JournalPanel = {
        id: createPanelId(),
        tabs: [],
        activeTabId: null,
        width: 1,
      };

      const newPanels = [...state.panels, newPanel];
      const newWidth = 1 / newPanels.length;
      const panelsWithWidth = newPanels.map((p) => ({ ...p, width: newWidth }));

      return {
        ...state,
        panels: panelsWithWidth,
        activePanelId: newPanel.id,
      };
    });
  },

  removePanel: (panelId: string) => {
    journalTabStore.setState((state) => {
      if (state.panels.length <= 1) return state;

      const panelIndex = state.panels.findIndex((p) => p.id === panelId);
      const newPanels = state.panels.filter((p) => p.id !== panelId);

      const newWidth = 1 / newPanels.length;
      const panelsWithWidth = newPanels.map((p) => ({ ...p, width: newWidth }));

      let newActivePanelId = state.activePanelId;
      if (state.activePanelId === panelId) {
        const newIndex = Math.min(panelIndex, panelsWithWidth.length - 1);
        newActivePanelId = panelsWithWidth[newIndex].id;
      }

      return {
        ...state,
        panels: panelsWithWidth,
        activePanelId: newActivePanelId,
      };
    });
  },

  setPanelWidths: (
    leftPanelId: string,
    rightPanelId: string,
    leftWidth: number,
    rightWidth: number,
  ) => {
    journalTabStore.setState((state) => ({
      ...state,
      panels: state.panels.map((p) => {
        if (p.id === leftPanelId) return { ...p, width: leftWidth };
        if (p.id === rightPanelId) return { ...p, width: rightWidth };
        return p;
      }),
    }));
  },

  reorderTabs: (panelId: string, fromIndex: number, toIndex: number) => {
    journalTabStore.setState((state) => {
      const panel = state.panels.find((p) => p.id === panelId);
      if (!panel) return state;

      const newTabs = [...panel.tabs];
      const [movedTab] = newTabs.splice(fromIndex, 1);
      newTabs.splice(toIndex, 0, movedTab);

      return {
        ...state,
        panels: state.panels.map((p) =>
          p.id === panelId ? { ...p, tabs: newTabs } : p,
        ),
      };
    });
  },

  moveTabToPanel: (
    fromPanelId: string,
    toPanelId: string,
    tabId: string,
    toIndex?: number,
  ) => {
    journalTabStore.setState((state) => {
      const fromPanel = state.panels.find((p) => p.id === fromPanelId);
      const toPanel = state.panels.find((p) => p.id === toPanelId);
      if (!fromPanel || !toPanel) return state;

      const tab = fromPanel.tabs.find((t) => t.id === tabId);
      if (!tab) return state;

      const newFromTabs = fromPanel.tabs.filter((t) => t.id !== tabId);
      let newFromActiveTabId = fromPanel.activeTabId;
      if (fromPanel.activeTabId === tabId) {
        if (newFromTabs.length > 0) {
          const removedIndex = fromPanel.tabs.findIndex((t) => t.id === tabId);
          const newIndex = Math.min(removedIndex, newFromTabs.length - 1);
          newFromActiveTabId = newFromTabs[newIndex].id;
        } else {
          newFromActiveTabId = null;
        }
      }

      const newToTabs = [...toPanel.tabs];
      if (toIndex !== undefined) {
        newToTabs.splice(toIndex, 0, tab);
      } else {
        newToTabs.push(tab);
      }

      return {
        ...state,
        panels: state.panels.map((p) => {
          if (p.id === fromPanelId) {
            return { ...p, tabs: newFromTabs, activeTabId: newFromActiveTabId };
          }
          if (p.id === toPanelId) {
            return { ...p, tabs: newToTabs, activeTabId: tabId };
          }
          return p;
        }),
        activePanelId: toPanelId,
      };
    });
  },

  addPanelWithTab: (
    fromPanelId: string,
    tabId: string,
    targetPanelId: string,
  ) => {
    journalTabStore.setState((state) => {
      const fromPanel = state.panels.find((p) => p.id === fromPanelId);
      if (!fromPanel) return state;

      const tab = fromPanel.tabs.find((t) => t.id === tabId);
      if (!tab) return state;

      const newFromTabs = fromPanel.tabs.filter((t) => t.id !== tabId);
      let newFromActiveTabId = fromPanel.activeTabId;
      if (fromPanel.activeTabId === tabId) {
        if (newFromTabs.length > 0) {
          const removedIndex = fromPanel.tabs.findIndex((t) => t.id === tabId);
          const newIndex = Math.min(removedIndex, newFromTabs.length - 1);
          newFromActiveTabId = newFromTabs[newIndex].id;
        } else {
          newFromActiveTabId = null;
        }
      }

      const newPanel: JournalPanel = {
        id: createPanelId(),
        tabs: [tab],
        activeTabId: tabId,
        width: 1,
      };

      const targetIndex = state.panels.findIndex((p) => p.id === targetPanelId);
      const newPanels = [...state.panels];
      newPanels[newPanels.findIndex((p) => p.id === fromPanelId)] = {
        ...fromPanel,
        tabs: newFromTabs,
        activeTabId: newFromActiveTabId,
      };
      newPanels.splice(targetIndex + 1, 0, newPanel);

      const newWidth = 1 / newPanels.length;
      const panelsWithWidth = newPanels.map((p) => ({ ...p, width: newWidth }));

      return {
        ...state,
        panels: panelsWithWidth,
        activePanelId: newPanel.id,
      };
    });
  },
});

// Persist state changes (journals는 저장하지 않음 - 매번 새로 로드)
if (typeof window !== "undefined") {
  journalTabStore.subscribe(() => {
    const state = journalTabStore.state;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        panels: state.panels.map((p) => ({
          ...p,
          tabs: p.tabs.map((t) => ({
            id: t.id,
            categoryId: t.categoryId,
            title: t.title,
            journals: [], // 일지 목록은 저장하지 않음
          })),
        })),
        activePanelId: state.activePanelId,
      }),
    );
  });
}

export const useJournalTabStore = <T>(
  selector: (state: JournalTabStoreState) => T,
): T => {
  return useStore(journalTabStore, selector);
};
