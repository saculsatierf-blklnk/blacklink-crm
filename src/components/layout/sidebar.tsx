"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Layers,
  LayoutDashboard,
  Receipt,
  Settings,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Leads B2B",
    href: "/leads",
    icon: Users,
  },
  {
    label: "Marketing",
    href: "/marketing",
    icon: Sparkles,
  },
  {
    label: "Operação & Prazos",
    href: "/operacao",
    icon: Layers,
  },
  {
    label: "Faturamento",
    href: "/faturamento",
    icon: Receipt,
  },
  {
    label: "Configurações",
    href: "/#configuracoes",
    icon: Settings,
  },
];

interface SidebarProps {
  initialRole?: "admin" | "commercial";
}

export function Sidebar({ initialRole }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  const activeRole = user?.role || initialRole || "admin";
  const isCommercial = activeRole === "commercial";

  // Perfil comercial visualiza exclusivamente a aba Leads B2B
  const visibleNavItems = isCommercial
    ? navItems.filter((item) => item.href === "/leads")
    : navItems;

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white/[0.02] backdrop-blur-2xl border-r border-white/10 min-h-screen text-zinc-100 z-30 transition-all">
      {/* Brand Header */}
      <div
        data-tour="sidebar-brand"
        className="flex h-18 items-center gap-3 px-6 border-b border-white/10"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-black font-semibold text-xs tracking-wider shadow-[0_0_15px_rgba(255,255,255,0.2)]">
          BL
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-xs tracking-tight text-white uppercase">
            Black Link
          </span>
          <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
            {isCommercial ? "Comercial" : "Enterprise CRM"}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav data-tour="sidebar-nav" className="flex-1 p-4 space-y-1.5">
        <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
          {isCommercial ? "Pipeline de Vendas" : "Navegação Principal"}
        </div>

        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === "/" && pathname === "/");

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-300 ${
                isActive
                  ? "bg-white/[0.10] text-white border border-white/15 font-medium shadow-sm backdrop-blur-md"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-zinc-400"}`} />
              <span className="tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Tenant Indicator Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-3.5 space-y-1.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">
            <Shield className="h-3 w-3 text-zinc-300" />
            <span>Perfil: {isCommercial ? "Comercial" : "Administrador"}</span>
          </div>
          <div className="text-xs font-semibold text-white tracking-tight truncate">
            {isCommercial ? "Pipeline de Prospecção" : "Black Link Matriz B2B"}
          </div>
          <div className="text-[10px] text-zinc-400 font-mono truncate">
            ID: {user?.company_id ? user.company_id.slice(0, 16) + "..." : "c-enterprise-main"}
          </div>
        </div>
      </div>
    </aside>
  );
}
