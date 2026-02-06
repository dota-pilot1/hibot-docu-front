import { Store, useStore } from "@tanstack/react-store";

export interface DocumentTab {
  id: number;
  title: string;
  isDirty: boolean;
  type: "document" | "folder";
  folderType?: "general" | "figma";
}

export interface DocumentPanel {
  id: string;
  tabs: DocumentTab[];
  activeTabId: number | null;
  width: number;
}

const DEFAULT_PANEL_ID = "doc-panel-1";

const createDefaultPanel = (): DocumentPanel => ({
  id: DEFAULT_PANEL_ID,
  tabs: [],
  activeTabId: null,
  width: 1,
});

export interface DocumentStoreState {
  // 사이드바
  isOpen: boolean;
  sidebarWidth: number;
  expandedFolders: Set<number>;

  // 패널/탭
  panels: DocumentPanel[];
  activePanelId: string;

  // 사이드바 액션
  toggle: () => void;
  setSidebarWidth: (width: number) => void;
  toggleFolder: (folderId: number) => void;

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
  openTab: (doc: { id: number; title: string }) => void;
  openFolderTab: (folder: {
    id: number;
    title: string;
    folderType?: "general" | "figma";
  }) => void;
  closeTab: (docId: number) => void;
  setActiveTab: (docId: number) => void;
  updateTabTitle: (docId: number, title: string) => void;
  setTabDirty: (docId: number, isDirty: boolean) => void;

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

const STORAGE_KEY = "document-sidebar-storage";

let panelIdCounter = 1;
const generatePanelId = () => `doc-panel-${++panelIdCounter}`;

const loadPersistedState = (): {
  isOpen: boolean;
  sidebarWidth: number;
  expandedFolders: number[];
  panels: DocumentPanel[];
  activePanelId: string;
} => {
  const defaultState = {
    isOpen: true,
    sidebarWidth: 256,
    expandedFolders: [] as number[],
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
          ? storedPanels.map((p: DocumentPanel) => ({
              ...p,
              tabs: p.tabs.map((t: DocumentTab) => ({
                ...t,
                type: t.type || "document",
              })),
            }))
          : [createDefaultPanel()];

      // panelIdCounter 복원
      const maxPanelNum = panels.reduce((max: number, p: DocumentPanel) => {
        const match = p.id.match(/doc-panel-(\d+)/);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
      }, 1);
      panelIdCounter = maxPanelNum;

      return {
        isOpen: parsed.isOpen ?? true,
        sidebarWidth: parsed.sidebarWidth ?? 256,
        expandedFolders: parsed.expandedFolders ?? [],
        panels,
        activePanelId: parsed.activePanelId ?? panels[0].id,
      };
    }
  } catch (e) {
    console.error("Failed to load document sidebar state", e);
  }
  return defaultState;
};

const persistedState = loadPersistedState();

export const documentStore = new Store<DocumentStoreState>({
  isOpen: persistedState.isOpen,
  sidebarWidth: persistedState.sidebarWidth,
  expandedFolders: new Set(persistedState.expandedFolders),
  panels: persistedState.panels,
  activePanelId: persistedState.activePanelId,

  toggle: () => {
    documentStore.setState((state) => ({ ...state, isOpen: !state.isOpen }));
  },

  setSidebarWidth: (width: number) => {
    documentStore.setState((state) => ({ ...state, sidebarWidth: width }));
  },

  toggleFolder: (folderId: number) => {
    documentStore.setState((state) => {
      const newExpanded = new Set(state.expandedFolders);
      if (newExpanded.has(folderId)) {
        newExpanded.delete(folderId);
      } else {
        newExpanded.add(folderId);
      }
      return { ...state, expandedFolders: newExpanded };
    });
  },

  // 패널 추가
  addPanel: () => {
    documentStore.setState((state) => {
      const newPanelId = generatePanelId();
      const activePanelIndex = state.panels.findIndex(
        (p) => p.id === state.activePanelId,
      );
      const insertIndex = activePanelIndex + 1;

      const newPanel: DocumentPanel = {
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

  // 패널 제거
  removePanel: (panelId: string) => {
    documentStore.setState((state) => {
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
    documentStore.setState((state) => ({
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
    documentStore.setState((state) => {
      const newPanels = state.panels.map((panel) => {
        if (panel.id === leftPanelId) return { ...panel, width: leftWidth };
        if (panel.id === rightPanelId) return { ...panel, width: rightWidth };
        return panel;
      });
      return { ...state, panels: newPanels };
    });
  },

  // 탭 열기 (모든 패널에서 이미 열린 탭 찾아서 활성화, 없으면 활성 패널에 추가)
  openTab: (doc: { id: number; title: string }) => {
    documentStore.setState((state) => {
      // 모든 패널에서 이미 열린 탭 찾기
      for (let i = 0; i < state.panels.length; i++) {
        const panel = state.panels[i];
        const existingTab = panel.tabs.find((t) => t.id === doc.id);
        if (existingTab) {
          // 해당 패널과 탭을 활성화
          const newPanels = [...state.panels];
          newPanels[i] = { ...panel, activeTabId: doc.id };
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
          { id: doc.id, title: doc.title, isDirty: false, type: "document" },
        ],
        activeTabId: doc.id,
      };

      return { ...state, panels: newPanels };
    });
  },

  // 폴더 탭 열기 (폴더 ID를 음수로 사용하여 문서 탭과 구분)
  openFolderTab: (folder: {
    id: number;
    title: string;
    folderType?: "general" | "figma";
  }) => {
    const tabId = -folder.id; // 폴더는 음수 ID
    documentStore.setState((state) => {
      // 모든 패널에서 이미 열린 폴더 탭 찾기
      for (let i = 0; i < state.panels.length; i++) {
        const panel = state.panels[i];
        const existingTab = panel.tabs.find((t) => t.id === tabId);
        if (existingTab) {
          const newPanels = [...state.panels];
          newPanels[i] = { ...panel, activeTabId: tabId };
          return { ...state, panels: newPanels, activePanelId: panel.id };
        }
      }

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
          {
            id: tabId,
            title: folder.title,
            isDirty: false,
            type: "folder",
            folderType: folder.folderType ?? "general",
          },
        ],
        activeTabId: tabId,
      };

      return { ...state, panels: newPanels };
    });
  },

  // 탭 닫기 (활성 패널에서)
  closeTab: (docId: number) => {
    documentStore.setState((state) => {
      const panelIndex = state.panels.findIndex(
        (p) => p.id === state.activePanelId,
      );
      if (panelIndex === -1) return state;

      const panel = state.panels[panelIndex];
      const newTabs = panel.tabs.filter((t) => t.id !== docId);

      let newActiveTabId = panel.activeTabId;
      if (panel.activeTabId === docId) {
        const closedIndex = panel.tabs.findIndex((t) => t.id === docId);
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

  setActiveTab: (docId: number) => {
    documentStore.setState((state) => {
      const panelIndex = state.panels.findIndex(
        (p) => p.id === state.activePanelId,
      );
      if (panelIndex === -1) return state;

      const panel = state.panels[panelIndex];
      const newPanels = [...state.panels];
      newPanels[panelIndex] = { ...panel, activeTabId: docId };

      return { ...state, panels: newPanels };
    });
  },

  updateTabTitle: (docId: number, title: string) => {
    // 현재 상태 확인하여 변경이 없으면 업데이트 안함 (무한 루프 방지)
    const currentState = documentStore.state;
    const tab = currentState.panels
      .flatMap((p) => p.tabs)
      .find((t) => t.id === docId);
    if (!tab || tab.title === title) return;

    documentStore.setState((state) => ({
      ...state,
      panels: state.panels.map((panel) => ({
        ...panel,
        tabs: panel.tabs.map((t) => (t.id === docId ? { ...t, title } : t)),
      })),
    }));
  },

  setTabDirty: (docId: number, isDirty: boolean) => {
    // 현재 상태 확인하여 변경이 없으면 업데이트 안함 (무한 루프 방지)
    const currentState = documentStore.state;
    const tab = currentState.panels
      .flatMap((p) => p.tabs)
      .find((t) => t.id === docId);
    if (!tab || tab.isDirty === isDirty) return;

    documentStore.setState((state) => ({
      ...state,
      panels: state.panels.map((panel) => ({
        ...panel,
        tabs: panel.tabs.map((t) => (t.id === docId ? { ...t, isDirty } : t)),
      })),
    }));
  },

  // 같은 패널 내 탭 순서 변경
  reorderTabs: (panelId: string, fromIndex: number, toIndex: number) => {
    documentStore.setState((state) => {
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
    documentStore.setState((state) => {
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

  // 탭을 새 패널로 분할
  addPanelWithTab: (
    fromPanelId: string,
    tabId: number,
    targetPanelId: string,
  ) => {
    documentStore.setState((state) => {
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
      const newPanel: DocumentPanel = {
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

// Persist state changes
if (typeof window !== "undefined") {
  documentStore.subscribe(() => {
    const state = documentStore.state;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        isOpen: state.isOpen,
        sidebarWidth: state.sidebarWidth,
        expandedFolders: Array.from(state.expandedFolders),
        panels: state.panels,
        activePanelId: state.activePanelId,
      }),
    );
  });
}

export const useDocumentStore = <T>(
  selector: (state: DocumentStoreState) => T,
): T => {
  return useStore(documentStore, selector);
};
