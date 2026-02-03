import { Store, useStore } from "@tanstack/react-store";

export interface SkillUserTab {
  id: number;
  email: string;
  name?: string;
}

export interface SkillPanel {
  id: string;
  tabs: SkillUserTab[];
  activeTabId: number | null;
  width: number; // flex 비율
}

const DEFAULT_PANEL_ID = "skill-panel-1";

const createDefaultPanel = (): SkillPanel => ({
  id: DEFAULT_PANEL_ID,
  tabs: [],
  activeTabId: null,
  width: 1,
});

export interface SkillTabState {
  panels: SkillPanel[];
  activePanelId: string;
  // 패널 관련
  addPanel: () => void;
  removePanel: (panelId: string) => void;
  setActivePanel: (panelId: string) => void;
  setPanelWidths: (
    leftPanelId: string,
    rightPanelId: string,
    leftWidth: number,
    rightWidth: number,
  ) => void;
  // 탭 관련
  openTab: (user: SkillUserTab) => void;
  closeTab: (userId: number) => void;
  setActiveTab: (userId: number) => void;
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

const STORAGE_KEY = "skill-tabs-storage";

let panelIdCounter = 1;
const generatePanelId = () => `skill-panel-${++panelIdCounter}`;

// 기본 상태 (서버/클라이언트 동일)
const defaultState = {
  panels: [createDefaultPanel()],
  activePanelId: DEFAULT_PANEL_ID,
};

// 클라이언트에서 localStorage 상태 복원 (hydration 후 호출)
let isHydrated = false;
const hydrateFromStorage = () => {
  if (isHydrated || typeof window === "undefined") return;
  isHydrated = true;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const panels =
        Array.isArray(parsed.panels) && parsed.panels.length > 0
          ? parsed.panels
          : [createDefaultPanel()];

      // panelIdCounter 복원
      const maxPanelNum = panels.reduce((max: number, p: SkillPanel) => {
        const match = p.id.match(/skill-panel-(\d+)/);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
      }, 1);
      panelIdCounter = maxPanelNum;

      skillTabStore.setState((state) => ({
        ...state,
        panels,
        activePanelId: parsed.activePanelId || panels[0].id,
      }));
    }
  } catch (e) {
    console.error("Failed to load skill tab state", e);
  }
};

export const skillTabStore = new Store<SkillTabState>({
  panels: defaultState.panels,
  activePanelId: defaultState.activePanelId,

  // 패널 추가 (활성 패널 오른쪽에)
  addPanel: () => {
    skillTabStore.setState((state) => {
      const newPanelId = generatePanelId();
      const activePanelIndex = state.panels.findIndex(
        (p) => p.id === state.activePanelId,
      );
      const insertIndex = activePanelIndex + 1;

      const newPanel: SkillPanel = {
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
    skillTabStore.setState((state) => {
      if (state.panels.length <= 1) return state;

      const panelIndex = state.panels.findIndex((p) => p.id === panelId);
      if (panelIndex === -1) return state;

      const closingPanel = state.panels[panelIndex];
      const targetPanelIndex = panelIndex > 0 ? panelIndex - 1 : panelIndex + 1;
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

  // 활성 패널 변경
  setActivePanel: (panelId: string) => {
    skillTabStore.setState((state) => ({
      ...state,
      activePanelId: panelId,
    }));
  },

  // 패널 너비 조정
  setPanelWidths: (
    leftPanelId: string,
    rightPanelId: string,
    leftWidth: number,
    rightWidth: number,
  ) => {
    skillTabStore.setState((state) => {
      const newPanels = state.panels.map((panel) => {
        if (panel.id === leftPanelId) return { ...panel, width: leftWidth };
        if (panel.id === rightPanelId) return { ...panel, width: rightWidth };
        return panel;
      });
      return { ...state, panels: newPanels };
    });
  },

  // 탭 열기 (모든 패널에서 확인 후 없으면 활성 패널에 추가)
  openTab: (user: SkillUserTab) => {
    skillTabStore.setState((state) => {
      // 모든 패널에서 이미 열린 탭 찾기
      for (let i = 0; i < state.panels.length; i++) {
        const panel = state.panels[i];
        const existingTab = panel.tabs.find((t) => t.id === user.id);
        if (existingTab) {
          const newPanels = [...state.panels];
          newPanels[i] = { ...panel, activeTabId: user.id };
          return {
            ...state,
            panels: newPanels,
            activePanelId: panel.id,
          };
        }
      }

      // 활성 패널에 새 탭 추가
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

      return { ...state, panels: newPanels };
    });
  },

  // 탭 닫기 (활성 패널에서)
  closeTab: (userId: number) => {
    skillTabStore.setState((state) => {
      const panelIndex = state.panels.findIndex(
        (p) => p.id === state.activePanelId,
      );
      if (panelIndex === -1) return state;

      const panel = state.panels[panelIndex];
      const newTabs = panel.tabs.filter((t) => t.id !== userId);

      let newActiveTabId = panel.activeTabId;
      if (panel.activeTabId === userId) {
        const closedIndex = panel.tabs.findIndex((t) => t.id === userId);
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

  // 탭 활성화
  setActiveTab: (userId: number) => {
    skillTabStore.setState((state) => {
      const panelIndex = state.panels.findIndex(
        (p) => p.id === state.activePanelId,
      );
      if (panelIndex === -1) return state;

      const panel = state.panels[panelIndex];
      const newPanels = [...state.panels];
      newPanels[panelIndex] = { ...panel, activeTabId: userId };

      return { ...state, panels: newPanels };
    });
  },

  // 같은 패널 내 탭 순서 변경
  reorderTabs: (panelId: string, fromIndex: number, toIndex: number) => {
    skillTabStore.setState((state) => {
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
    skillTabStore.setState((state) => {
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
    skillTabStore.setState((state) => {
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
      const newPanel: SkillPanel = {
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

// localStorage에 상태 저장
if (typeof window !== "undefined") {
  skillTabStore.subscribe(() => {
    const state = skillTabStore.state;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        panels: state.panels,
        activePanelId: state.activePanelId,
      }),
    );
  });
}

// React hook
export const useSkillTabStore = <T>(
  selector: (state: SkillTabState) => T,
): T => {
  return useStore(skillTabStore, selector);
};

// hydrate 함수 export
export { hydrateFromStorage as hydrateSkillTabStore };
