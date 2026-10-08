"use client";

import React from "react";
import { Search, Plus, Bell, Command } from "lucide-react";
import { useTenantStore } from "@/store/useTenantStore";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onOpenNewDealModal: () => void;
}

export function Header({ onOpenNewDealModal }: HeaderProps) {
  const { currentView, searchQuery, setSearchQuery, activeTenantId, tenants } =
    useTenantStore();
  const activeTenant =
    tenants.find((t) => t.id === activeTenantId) || tenants[0];

  const viewTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: "Visão Executiva",
      subtitle: "Métricas de MRR, conversão e pipeline consolidado",
    },
    pipeline: {
      title: "Pipeline de Oportunidades",
      subtitle: "Visualização Kanban e fluxo de fechamento B2B",
    },
    leads: {
      title: "Contas & Leads Corporativos",
      subtitle: "Base de tomadores de decisão e empresas em prospecção",
    },
    portal: {
      title: "Portal do Cliente SaaS",
      subtitle: "Área restrita de entregáveis e transparência de projetos",
    },
    settings: {
      title: "Configurações Corporativas",
      subtitle: "Gestão de acessos, integrações e dados da organização",
    },
  };

  const current = viewTitles[currentView] || viewTitles.dashboard;

  return (
    <header className="h-16 px-6 bg-carbon border-b border-border-hairline flex items-center justify-between select-none">
      {/* TÍTULO DA VISÃO ATUAL */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-gold">
            {activeTenant.code}
          </span>
          <span className="text-muted text-xs">/</span>
          <h1 className="text-sm font-bold uppercase tracking-wider text-foreground">
            {current.title}
          </h1>
        </div>
        <span className="text-[11px] text-muted hidden sm:inline">
          {current.subtitle}
        </span>
      </div>

      {/* AÇÕES CENTRAIS / BUSCA & BOTÕES */}
      <div className="flex items-center gap-3">
        {/* BUSCA UNIVERSAL */}
        <div className="relative w-48 md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar contas, deals..."
            className="w-full h-9 pl-9 pr-8 bg-surface border border-border-hairline text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-border-focus transition-colors"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-muted pointer-events-none">
            <Command className="h-3 w-3" />
            <span className="font-mono text-[9px]">K</span>
          </div>
        </div>

        {/* NOTIFICAÇÕES */}
        <button
          type="button"
          className="h-9 w-9 flex items-center justify-center bg-surface border border-border-hairline text-muted hover:text-white hover:border-border-focus transition-colors relative"
          title="Notificações do Sistema"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-gold rounded-full" />
        </button>

        {/* BOTÃO NOVO DEAL */}
        <Button
          variant="accent"
          size="sm"
          onClick={onOpenNewDealModal}
          className="flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Nova Oportunidade</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </div>
    </header>
  );
}
