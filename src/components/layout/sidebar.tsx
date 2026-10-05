"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Layers,
  LayoutDashboard,
  Receipt,
  Settings,
  Shield,
  Sparkles,
  Target,
  Wand2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { useUiStore } from "@/store/useUiStore";

export interface NavItem {
  label: string;
  shortLabel: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

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
  const user = useAuthStore((state) => state.user);
  const {
    isSidebarCollapsed,
    toggleSidebar,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
  } = useUiStore();

  const activeRole = user?.role || initialRole || "admin";
  const isCommercial = activeRole === "commercial";

  // Perfil comercial visualiza exclusivamente a aba Vendas B2B
  const visibleNavItems = isCommercial
    ? CANONICAL_NAV_ITEMS.filter((item) => item.href === "/vendas")
    : CANONICAL_NAV_ITEMS.filter((item) => !item.adminOnly || activeRole === "admin");

  const isRouteActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const sidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="flex h-18 items-center justify-between px-4 border-b border-white/[0.08] relative">
        <Link
          href={isCommercial ? "/vendas" : "/dashboard"}
          className="flex items-center gap-3 overflow-hidden cursor-pointer"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-white to-zinc-300 text-black font-semibold text-xs tracking-wider shadow-[0_0_20px_rgba(255,255,255,0.25)]">
            BL
          </div>

          {(!isSidebarCollapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col min-w-0"
            >
              <span className="font-heading font-semibold text-xs tracking-tight text-white uppercase truncate">
                Black Link
              </span>
              <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase truncate">
                {isCommercial ? "Comercial" : "Enterprise CRM"}
              </span>
            </motion.div>
          )}
        </Link>

        {/* Botão de Fechar no Mobile */}
        {isMobile ? (
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          /* Botão de Recolher/Expandir Desktop */
          <button
            type="button"
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
            className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
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
      <nav data-tour="sidebar-nav" className="flex-1 p-3 space-y-1.5 overflow-y-auto overflow-x-hidden">
        {(!isSidebarCollapsed || isMobile) && (
          <div className="px-3 pb-2 pt-1 text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
            {isCommercial ? "Pipeline de Vendas" : "Módulos Principais"}
          </div>
        )}

        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const active = isRouteActive(item.href);

          return (
            <div key={item.href} className="relative group">
              <Link
                href={item.href}
                onClick={() => {
                  if (isMobile) setMobileSidebarOpen(false);
                }}
                className={`flex items-center gap-3 rounded-xl transition-all duration-200 cursor-pointer ${
                  isSidebarCollapsed && !isMobile
                    ? "h-11 w-11 mx-auto justify-center"
                    : "px-3.5 py-2.5 text-xs"
                } ${
                  active
                    ? "bg-white/[0.12] text-white border border-white/20 font-medium shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-md"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.05] border border-transparent"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    active ? "text-white" : "text-zinc-400 group-hover:text-white"
                  }`}
                />

                {(!isSidebarCollapsed || isMobile) && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="tracking-tight truncate font-sans text-xs"
                  >
                    {item.label}
                  </motion.span>
                )}
              </Link>

              {/* Tooltip flutuante quando colapsada */}
              {isSidebarCollapsed && !isMobile && (
                <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3.5 hidden group-hover:flex items-center z-50">
                  <div className="rounded-xl border border-white/20 bg-[#0C0C0E]/95 px-3 py-1.5 text-xs font-medium text-white shadow-2xl backdrop-blur-xl whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                    <div className="font-heading">{item.label}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Tenant Indicator Footer */}
      <div className="p-3 border-t border-white/[0.08]">
        {isSidebarCollapsed && !isMobile ? (
          <div className="flex justify-center">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-300"
              title={`Perfil: ${isCommercial ? "Comercial" : "Administrador"}`}
            >
              <Shield className="h-4 w-4 text-zinc-400" />
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-3.5 space-y-1.5 shadow-sm"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">
              <Shield className="h-3 w-3 text-zinc-300" />
              <span>Perfil: {isCommercial ? "Comercial" : "Administrador"}</span>
            </div>
            <div className="text-xs font-semibold text-white tracking-tight truncate">
              {isCommercial ? "Pipeline de Prospecção" : "Black Link Matriz B2B"}
            </div>
            <div className="text-[10px] text-zinc-500 font-mono truncate">
              ID: {user?.company_id ? user.company_id.slice(0, 16) + "..." : "c-enterprise-main"}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar Desktop Flutuante / Retrátil */}
      <aside
        className={`hidden md:flex flex-col fixed top-0 left-0 h-screen z-30 bg-[#050505]/85 backdrop-blur-2xl border-r border-white/10 text-zinc-100 transition-[width] duration-300 ease-in-out shadow-2xl ${
          isSidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {sidebarContent(false)}
      </aside>

      {/* Drawer Mobile com Backdrop e Framer Motion */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Menu Slide-in */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="relative z-10 w-72 h-full bg-[#08080A] border-r border-white/10 shadow-2xl flex flex-col"
            >
              {sidebarContent(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
