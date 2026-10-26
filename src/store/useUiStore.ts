import { create } from "zustand";
import { persist } from "zustand/middleware";

export type VendasWorkspaceTab =
  | "planilha"
  | "cadencia"
  | "nichos"
  | "kanban"
  | "integracao";

interface UiState {
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  activeVendasTab: VendasWorkspaceTab;
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
      activeVendasTab: "integracao",
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
      name: "blacklink-ui-storage-v3",
      partialize: (state) => ({
        isSidebarCollapsed: state.isSidebarCollapsed,
        activeVendasTab: state.activeVendasTab,
      }),
    }
  )
);

