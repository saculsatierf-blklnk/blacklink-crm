"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { DashboardView } from "@/components/views/dashboard-view";
import { PipelineKanbanView } from "@/components/views/pipeline-kanban-view";
import { LeadsTableView } from "@/components/views/leads-table-view";
import { PortalClientView } from "@/components/views/portal-client-view";
import { NewDealModal } from "@/components/modals/new-deal-modal";
import { useTenantStore } from "@/store/useTenantStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function CRMMainPage() {
  const { currentView } = useTenantStore();
  const [isNewDealModalOpen, setIsNewDealModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-void text-foreground">
      {/* BARRA LATERAL FIXA */}
      <Sidebar />

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenNewDealModal={() => setIsNewDealModalOpen(true)} />

        <main className="flex-1 p-6 overflow-y-auto">
          {currentView === "dashboard" && <DashboardView />}
          {currentView === "pipeline" && <PipelineKanbanView />}
          {currentView === "leads" && <LeadsTableView />}
          {currentView === "portal" && <PortalClientView />}
          {currentView === "settings" && (
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>Configurações da Organização</CardTitle>
                <span className="text-xs text-muted">
                  Definições gerais do Tenant e credenciais de API
                </span>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-xs text-muted">
                <p>
                  Painel de governança corporativa multi-tenant. Aqui os administradores podem configurar webhooks, chaves de integração para Webhooks de Leads e regras de comissionamento de equipe.
                </p>
                <div className="p-3 bg-surface border border-border-hairline font-mono text-[10px] text-gold">
                  STATUS: AMBIENTE MULTI-TENANT ISOLADO ATIVO
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* MODAL DE CADASTRO DE OPORTUNIDADE */}
      <NewDealModal
        isOpen={isNewDealModalOpen}
        onClose={() => setIsNewDealModalOpen(false)}
      />
    </div>
  );
}
