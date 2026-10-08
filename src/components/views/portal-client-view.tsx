"use client";

import React from "react";
import { CheckCircle2, Clock, ShieldCheck, Terminal, FileText, ArrowUpRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function PortalClientView() {
  const deliverables = [
    {
      id: "deliv-01",
      title: "Arquitetura Cloud & Microsserviços",
      client: "Vanguard Asset Management",
      sla: "99.95% Uptime",
      status: "Em Produção",
      completion: 92,
      deadline: "2026-10-15",
    },
    {
      id: "deliv-02",
      title: "Agentes Autônomos de IA & Triagem",
      client: "Logix Supply Chain",
      sla: "Latência < 200ms",
      status: "Em Homologação",
      completion: 78,
      deadline: "2026-11-01",
    },
    {
      id: "deliv-03",
      title: "Pipeline de Dados & BI Conectado",
      client: "OmniCorp Seguros",
      sla: "Sync Diário às 04:00",
      status: "Ativo & Monitorado",
      completion: 100,
      deadline: "2026-09-30",
    },
  ];

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* BANNER DO CLIENT PORTAL */}
      <Card className="bg-gradient-to-r from-carbon via-surface to-carbon border-border-hairline p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-gold">
                Portal do Cliente SaaS // Visão Externa
              </span>
            </div>
            <h2 className="text-xl font-bold uppercase tracking-wide text-foreground">
              Transparência de Entregáveis & Governança de SLA
            </h2>
            <p className="text-xs text-muted max-w-2xl">
              Ambiente espelhado para os tomadores de decisão acompanharem o avanço dos projetos de Tecnologia, Automações e Performance contratados.
            </p>
          </div>

          <Button variant="outline" size="sm" className="flex items-center gap-1.5 shrink-0">
            <FileText className="h-3.5 w-3.5" />
            <span>Emitir Relatório Executivo</span>
          </Button>
        </div>
      </Card>

      {/* GRID DE ENTREGÁVEIS & STATUS DE SPRINT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {deliverables.map((item) => (
          <Card key={item.id} className="p-5 flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-wider text-muted">
                  {item.client}
                </span>
                <Badge variant={item.completion === 100 ? "won" : "qualification"}>
                  {item.status}
                </Badge>
              </div>

              <h3 className="text-sm font-semibold text-foreground leading-snug">
                {item.title}
              </h3>

              <div className="flex items-center gap-2 text-[11px] text-muted font-mono pt-1">
                <ShieldCheck className="h-3.5 w-3.5 text-gold" />
                <span>SLA: {item.sla}</span>
              </div>
            </div>

            {/* BARRA DE PROGRESSO */}
            <div className="flex flex-col gap-1.5 pt-3 border-t border-border-hairline/60">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-muted">Avanço Técnico</span>
                <span className="text-gold font-bold">{item.completion}%</span>
              </div>
              <div className="w-full h-1 bg-surface-elevated overflow-hidden">
                <div
                  className="h-full bg-gold transition-all duration-500"
                  style={{ width: `${item.completion}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-muted font-mono pt-1">
                <span>Entrega Prevista</span>
                <span>{item.deadline}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
