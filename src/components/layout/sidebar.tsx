"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  KanbanSquare,
  Building2,
  ExternalLink,
  Settings,
  ChevronDown,
  Layers,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useTenantStore } from "@/store/useTenantStore";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const {
    tenants,
    activeTenantId,
    setActiveTenantId,
    currentView,
    setCurrentView,
  } = useTenantStore();

  const [isTenantMenuOpen, setIsTenantMenuOpen] = useState(false);
  const activeTenant =
    tenants.find((t) => t.id === activeTenantId) || tenants[0];

  const navigation = [
    {
      id: "dashboard",
      name: "Dashboard Executivo",
      icon: LayoutDashboard,
      badge: "MRR",
    },
    {
      id: "pipeline",
      name: "Pipeline de Vendas",
      icon: KanbanSquare,
      badge: "Kanban",
    },
    {
      id: "leads",
      name: "Contas & Leads B2B",
      icon: Building2,
      badge: "Base",
    },
    {
      id: "portal",
      name: "Portal do Cliente",
      icon: ExternalLink,
      badge: "SaaS",
    },
    {
      id: "settings",
      name: "Configurações",
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 min-h-screen bg-carbon border-r border-border-hairline flex flex-col justify-between select-none">
      <div className="flex flex-col">
        {/* LOGO CORPORATIVA BLACK LINK */}
        <div className="h-16 px-5 border-b border-border-hairline flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 bg-white text-black font-bold flex items-center justify-center text-xs tracking-tighter">
              BL
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xs uppercase tracking-[0.2em] text-foreground">
                BLACK LINK
              </span>
              <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-gold">
                ENTERPRISE CRM
              </span>
            </div>
          </div>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* TENANT SWITCHER (MULTI-TENANT DROPDOWN) */}
        <div className="p-3 border-b border-border-hairline relative">
          <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted mb-1 block px-2">
            Organização Ativa
          </label>
          <button
            type="button"
            onClick={() => setIsTenantMenuOpen(!isTenantMenuOpen)}
            className="w-full flex items-center justify-between p-2.5 bg-surface border border-border-hairline hover:border-border-focus text-left transition-colors"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Layers className="h-4 w-4 text-gold shrink-0" />
              <div className="truncate">
                <div className="text-xs font-semibold text-foreground truncate">
                  {activeTenant.name}
                </div>
                <div className="font-mono text-[9px] text-muted">
                  {activeTenant.code} • {activeTenant.activeContracts} Contratos
                </div>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted transition-transform shrink-0 ml-1",
                isTenantMenuOpen && "rotate-180 text-foreground"
              )}
            />
          </button>

          {/* DROPDOWN MENU */}
          {isTenantMenuOpen && (
            <div className="absolute top-full left-3 right-3 mt-1 bg-surface-elevated border border-border-focus shadow-2xl z-50 p-1 divide-y divide-border-hairline/40">
              {tenants.map((tenant) => (
                <button
                  key={tenant.id}
                  type="button"
                  onClick={() => {
                    setActiveTenantId(tenant.id);
                    setIsTenantMenuOpen(false);
                  }}
                  className={cn(
                    "w-full text-left p-2.5 flex items-center justify-between text-xs hover:bg-surface-hover transition-colors",
                    tenant.id === activeTenantId && "bg-surface text-gold font-medium"
                  )}
                >
                  <div>
                    <div className="text-foreground">{tenant.name}</div>
                    <div className="font-mono text-[8px] text-muted">{tenant.segment}</div>
                  </div>
                  {tenant.id === activeTenantId && (
                    <span className="font-mono text-[9px] text-gold">ATIVO</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* NAVEGAÇÃO PRINCIPAL */}
        <nav className="p-3 flex flex-col gap-1">
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted px-2 py-1.5">
            Módulos de Operação
          </div>
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setCurrentView(
                    item.id as "dashboard" | "pipeline" | "leads" | "portal" | "settings"
                  )
                }
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 text-xs transition-all duration-150 text-left rounded-none group",
                  isActive
                    ? "bg-surface-elevated text-white border-l-2 border-gold font-medium"
                    : "text-subtle hover:text-white hover:bg-surface/50"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive ? "text-gold" : "text-muted group-hover:text-white"
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "font-mono text-[8px] uppercase tracking-wider px-1.5 py-0.5 border",
                      isActive
                        ? "bg-gold/10 text-gold border-gold/30"
                        : "bg-surface text-muted border-border-hairline"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* RODAPÉ DA SIDEBAR: OPERADOR LOGADO & STATUS */}
      <div className="p-4 border-t border-border-hairline bg-surface/30 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-gold" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted">
              Nível: Admin
            </span>
          </div>
          <span className="font-mono text-[8px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 border border-emerald-500/30">
            SLA 99.9%
          </span>
        </div>

        <div className="flex items-center gap-3 pt-1 border-t border-border-hairline/40">
          <div className="h-8 w-8 bg-surface-elevated border border-border-hairline flex items-center justify-center font-bold text-xs text-foreground">
            LS
          </div>
          <div className="flex flex-col truncate">
            <span className="text-xs font-semibold text-foreground truncate">
              Lucas S.
            </span>
            <span className="font-mono text-[8px] text-muted truncate">
              lucas@blacklink.com.br
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
