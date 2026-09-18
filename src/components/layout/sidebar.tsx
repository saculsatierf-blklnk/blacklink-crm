"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  Settings,
  Shield,
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
    label: "Conteúdos",
    href: "/conteudos",
    icon: FileText,
  },
  {
    label: "Configurações",
    href: "/#configuracoes",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-carbon border-r border-glass-border min-h-screen text-platinum">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-glass-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-void font-bold text-sm tracking-widest">
          BL
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-platinum">
            Black Link
          </span>
          <span className="text-[10px] font-mono text-sub">CRM &bull; SaaS Enterprise</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5">
        <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-sub">
          Navegação Principal
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === "/" && pathname === "/");

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-carbon-muted text-accent border border-glass-border font-semibold"
                  : "text-sub hover:text-platinum hover:bg-carbon-muted/50"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-accent" : "text-sub"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Tenant Indicator Footer */}
      <div className="p-4 border-t border-glass-border">
        <div className="rounded-lg border border-glass-border bg-void/50 p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-sub">
            <Shield className="h-3 w-3 text-platinum" />
            <span>Tenant Ativo</span>
          </div>
          <div className="text-xs font-semibold text-platinum truncate">
            Black Link Matriz B2B
          </div>
          <div className="text-[10px] text-sub font-mono truncate">
            ID: {user?.company_id ? user.company_id.slice(0, 16) + "..." : "c-enterprise-main"}
          </div>
        </div>
      </div>
    </aside>
  );
}
