"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Compass,
  FileSpreadsheet,
  Kanban as KanbanIcon,
  Layers,
  LayoutDashboard,
  Receipt,
  Settings,
  Shield,
  Target,
  Terminal,
  Wand2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { useUiStore, type VendasWorkspaceTab } from "@/store/useUiStore";

export interface NavItem {
  label: string;
  shortLabel: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

export interface VendasSidebarTabItem {
  id: VendasWorkspaceTab;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const VENDAS_SIDEBAR_TABS: VendasSidebarTabItem[] = [
  {
    id: "integracao",
    label: "Conectar Google Sheets",
    shortLabel: "Conexão",
    icon: Terminal,
  },
  {
    id: "nichos",
    label: "Estudo & Mapa de Setores",
    shortLabel: "Setores",
    icon: Compass,
  },
  {
    id: "planilha",
    label: "Planilha & Captação",
    shortLabel: "Planilha",
    icon: FileSpreadsheet,
  },
  {
    id: "kanban",
    label: "Pipeline Kanban",
    shortLabel: "Kanban",
    icon: KanbanIcon,
  },
  {
    id: "cadencia",
    label: "Cadência & Catálogo PDF",
    shortLabel: "Cadência",
    icon: Calendar,
  },
];

export const CANONICAL_NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    shortLabel: "Cockpit",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Vendas B2B",
    shortLabel: "Vendas",
    href: "/vendas",
    icon: Target,
  },
  {
    label: "Estúdio de IA",
    shortLabel: "Estúdio",
    href: "/estudio",
    icon: Wand2,
  },
  {
    label: "Operações",
    shortLabel: "Prazos",
    href: "/operacoes",
    icon: Layers,
  },
  {
    label: "Financeiro",
    shortLabel: "Contratos",
    href: "/financeiro",
    icon: Receipt,
  },
  {
    label: "Configurações",
    shortLabel: "Ajustes",
    href: "/configuracoes",
    icon: Settings,
    adminOnly: true,
  },
];

interface SidebarProps {
  initialRole?: "admin" | "commercial";
}

export function Sidebar({ initialRole }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const {
    isSidebarCollapsed,
    toggleSidebar,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
    activeVendasTab,
    setActiveVendasTab,
  } = useUiStore();

  const activeRole = user?.role || initialRole || "admin";
  const isCommercial = activeRole === "commercial";

  const isOnVendas =
    pathname === "/vendas" || pathname.startsWith("/vendas/");

  const adminNavItems = CANONICAL_NAV_ITEMS.filter(
    (item) =>
      item.href !== "/vendas" && (!item.adminOnly || activeRole === "admin")
  );

  const isRouteActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleSelectVendasTab = (
    tabId: VendasWorkspaceTab,
    isMobile = false
  ) => {
    setActiveVendasTab(tabId);
    if (!isOnVendas) {
      router.push("/vendas");
    }
    if (isMobile) {
      setMobileSidebarOpen(false);
    }
  };

  const sidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full select-none bg-[#000000]">
      {/* Brand Header na estética irvo.com.br */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-[#2e2e2e] relative">
        <Link
          href={isCommercial ? "/vendas" : "/dashboard"}
          className="flex items-center gap-3 overflow-hidden cursor-pointer"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#0d0d0d] font-bold text-xs tracking-tight">
            BL
          </div>

          {(!isSidebarCollapsed || isMobile) && (
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-xs tracking-tight text-white truncate">
                Black Link
              </span>
              <span className="text-[11px] text-[#afafaf] truncate">
                {isCommercial ? "Comercial" : "Enterprise CRM"}
              </span>
            </div>
          )}
        </Link>

        {/* Botão de Fechar no Mobile */}
        {isMobile ? (
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] text-[#afafaf] hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          /* Botão de Recolher/Expandir Desktop */
          <button
            type="button"
            onClick={toggleSidebar}
            title={
              isSidebarCollapsed
                ? "Expandir barra lateral"
                : "Recolher barra lateral"
            }
            className="hidden md:flex h-7 w-7 items-center justify-center rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] text-[#afafaf] hover:text-white hover:bg-[#262626] transition-colors cursor-pointer"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav
        data-tour="sidebar-nav"
        className="flex-1 p-3 space-y-5 overflow-y-auto overflow-x-hidden"
      >
        {/* SEÇÃO 1: PIPELINE DE VENDAS (AS 5 ABAS NA ESQUERDA) */}
        <div className="space-y-1">
          {(!isSidebarCollapsed || isMobile) && (
            <div className="px-3 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wider text-[#757575]">
              Pipeline de Vendas
            </div>
          )}

          {VENDAS_SIDEBAR_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = isOnVendas && activeVendasTab === tab.id;

            return (
              <div key={tab.id} className="relative group">
                <button
                  type="button"
                  onClick={() => handleSelectVendasTab(tab.id, isMobile)}
                  className={`w-full flex items-center gap-3 rounded-lg transition-colors cursor-pointer text-left ${
                    isSidebarCollapsed && !isMobile
                      ? "h-10 w-10 mx-auto justify-center"
                      : "px-3 py-2.5 text-xs"
                  } ${
                    active
                      ? "bg-white text-[#0d0d0d] font-semibold"
                      : "text-[#afafaf] hover:text-white hover:bg-[#1a1a1a]"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      active
                        ? "text-[#0d0d0d]"
                        : "text-[#afafaf] group-hover:text-white"
                    }`}
                  />

                  {(!isSidebarCollapsed || isMobile) && (
                    <span className="truncate text-xs">{tab.label}</span>
                  )}
                </button>

                {/* Tooltip flutuante quando colapsada */}
                {isSidebarCollapsed && !isMobile && (
                  <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover:flex items-center z-50">
                    <div className="rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] px-3 py-1.5 text-xs font-semibold text-white whitespace-nowrap">
                      {tab.label}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* SEÇÃO 2: MÓDULOS ADMINISTRATIVOS (Apenas quando perfil Admin) */}
        {!isCommercial && (
          <div className="space-y-1 border-t border-[#2e2e2e] pt-4">
            {(!isSidebarCollapsed || isMobile) && (
              <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#757575]">
                Módulos Enterprise
              </div>
            )}

            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const active = isRouteActive(item.href);

              return (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (isMobile) setMobileSidebarOpen(false);
                    }}
                    className={`flex items-center gap-3 rounded-lg transition-colors cursor-pointer ${
                      isSidebarCollapsed && !isMobile
                        ? "h-10 w-10 mx-auto justify-center"
                        : "px-3 py-2.5 text-xs"
                    } ${
                      active
                        ? "bg-white text-[#0d0d0d] font-semibold"
                        : "text-[#afafaf] hover:text-white hover:bg-[#1a1a1a]"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        active
                          ? "text-[#0d0d0d]"
                          : "text-[#afafaf] group-hover:text-white"
                      }`}
                    />

                    {(!isSidebarCollapsed || isMobile) && (
                      <span className="truncate text-xs">{item.label}</span>
                    )}
                  </Link>

                  {isSidebarCollapsed && !isMobile && (
                    <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover:flex items-center z-50">
                      <div className="rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] px-3 py-1.5 text-xs font-semibold text-white whitespace-nowrap">
                        {item.label}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </nav>

      {/* Tenant Indicator Footer na estética irvo.com.br */}
      <div className="p-3 border-t border-[#2e2e2e]">
        {isSidebarCollapsed && !isMobile ? (
          <div className="flex justify-center">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1a1a1a] ring-1 ring-[#2e2e2e] text-[#afafaf]"
              title={`Perfil: ${isCommercial ? "Comercial" : "Administrador"}`}
            >
              <Shield className="h-4 w-4" />
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-[#0d0d0d] ring-1 ring-[#2e2e2e] p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#afafaf]">
              <Shield className="h-3 w-3 text-white" />
              <span>Perfil: {isCommercial ? "Comercial" : "Administrador"}</span>
            </div>
            <div className="text-xs font-semibold text-white truncate">
              {isCommercial ? "Pipeline de Prospecção" : "Black Link Matriz B2B"}
            </div>
            <div className="text-[11px] text-[#757575] tabular-nums truncate">
              ID: {user?.company_id ? user.company_id.slice(0, 16) + "..." : "c-enterprise-main"}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar Desktop na estética irvo.com.br */}
      <aside
        className={`hidden md:flex flex-col fixed top-0 left-0 h-screen z-30 bg-[#000000] border-r border-[#2e2e2e] text-white transition-[width] duration-300 ease-in-out ${
          isSidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {sidebarContent(false)}
      </aside>

      {/* Drawer Mobile */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="relative z-10 w-72 h-full bg-[#000000] border-r border-[#2e2e2e] flex flex-col"
            >
              {sidebarContent(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

