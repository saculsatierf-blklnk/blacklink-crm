import { create } from "zustand";
import { persist } from "zustand/middleware";

export type VendasWorkspaceTab =
  | "planilha"
  | "cadencia"
  | "nichos"
  | "kanban"
  | "integracao"
  | "metricas";

interface UiState {
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  activeVendasTab: VendasWorkspaceTab;
  leadSearchQuery: string;
  setLeadSearchQuery: (query: string) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setActiveVendasTab: (tab: VendasWorkspaceTab) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      isSidebarCollapsed: false,
      isMobileSidebarOpen: false,
      activeVendasTab: "kanban",
      leadSearchQuery: "",
      setLeadSearchQuery: (query: string) => set({ leadSearchQuery: query }),
      toggleSidebar: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSidebarCollapsed: (collapsed: boolean) =>
        set({ isSidebarCollapsed: collapsed }),
      toggleMobileSidebar: () =>
        set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
      setMobileSidebarOpen: (open: boolean) =>
        set({ isMobileSidebarOpen: open }),
      setActiveVendasTab: (tab: VendasWorkspaceTab) =>
        set({ activeVendasTab: tab }),
    }),
    {
      name: "blacklink-ui-storage-v4",
      partialize: (state) => ({
        isSidebarCollapsed: state.isSidebarCollapsed,
        activeVendasTab: state.activeVendasTab,
      }),
    }
  )
);

