"use client";

import React, { useState } from "react";
import { Building2, Phone, Mail, Filter, Download } from "lucide-react";
import { useTenantStore } from "@/store/useTenantStore";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function LeadsTableView() {
  const { leads, searchQuery } = useTenantStore();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      !searchQuery ||
      lead.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.decisionMaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.serviceOfInterest.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusVariants: Record<string, any> = {
    "Novo": "prospecting",
    "Contatado": "qualification",
    "Em Qualificação": "proposal",
    "Proposta Enviada": "negotiation",
    "Cliente Ativo": "won",
  };

  return (
    <div className="flex flex-col gap-4 select-none">
      {/* BARRA DE FILTROS SUPERIOR */}
      <div className="p-4 bg-carbon border border-border-hairline flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted mr-2 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Status:
          </span>
          {["ALL", "Novo", "Em Qualificação", "Proposta Enviada", "Cliente Ativo"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider border transition-colors ${
                statusFilter === st
                  ? "bg-gold/15 text-gold border-gold/40 font-semibold"
                  : "bg-surface text-muted border-border-hairline hover:text-white"
              }`}
            >
              {st === "ALL" ? "Todos" : st}
            </button>
          ))}
        </div>

        <Button variant="outline" size="sm" className="flex items-center gap-1.5 shrink-0">
          <Download className="h-3.5 w-3.5" />
          <span>Exportar CSV</span>
        </Button>
      </div>

      {/* TABELA DE CONTAS E LEADS */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa / Conta</TableHead>
              <TableHead>Tomador de Decisão</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Porte / Receita</TableHead>
              <TableHead>Serviço Requisitado</TableHead>
              <TableHead>Status B2B</TableHead>
              <TableHead className="text-right">Último Contato</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <Building2 className="h-3.5 w-3.5 text-gold shrink-0" />
                    <span>{lead.companyName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-foreground">{lead.decisionMaker}</span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5 text-[11px] text-muted">
                    <span className="flex items-center gap-1">
                      <Mail className="h-2.5 w-2.5" /> {lead.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-2.5 w-2.5" /> {lead.phone}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-[10px] text-muted">
                    {lead.annualRevenueTier}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-[10px] text-subtle">
                    {lead.serviceOfInterest}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariants[lead.status] || "default"}>
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono text-[10px] text-muted">
                  {lead.lastInteraction}
                </TableCell>
              </TableRow>
            ))}

            {filteredLeads.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted font-mono text-[11px]">
                  Nenhuma conta corporativa encontrada com os filtros selecionados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
