"use client";

import { useEffect } from "react";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Globe,
  Mail,
  Phone,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import type { Lead } from "@/db/schema";
import type { LeadStatus } from "@/actions/leads";

interface LeadDetailsSheetProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (leadId: string, newStatus: LeadStatus) => void;
}

export function LeadDetailsSheet({
  lead,
  isOpen,
  onClose,
  onStatusChange,
}: LeadDetailsSheetProps) {
  // Fecha o painel ao pressionar a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !lead) return null;

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const isAutomation =
    lead.origin?.toLowerCase().includes("n8n") ||
    lead.origin?.toLowerCase().includes("webhook");

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop Translúcido com Blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* Painel Lateral (Slide-over Sheet) em Estilo Dark Industrial */}
      <div className="relative z-50 flex h-full w-full max-w-md flex-col justify-between border-l border-glass-border bg-carbon p-6 shadow-2xl sm:p-8 animate-in slide-in-from-right duration-200">
        <div className="space-y-6 overflow-y-auto pr-1">
          {/* Cabeçalho do Drawer */}
          <div className="flex items-center justify-between border-b border-glass-border pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-sub">
                Dossiê do Lead
              </span>
              <h2 className="text-base font-bold text-platinum">
                Detalhes da Conta B2B
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-glass-border bg-carbon-muted text-sub hover:text-platinum hover:border-accent/40 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Identificação Principal */}
          <div className="space-y-2">
            <div className="text-xl font-bold text-platinum leading-tight">
              {lead.leadName}
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-sub">
              <span>ID: {lead.id}</span>
              <button
                onClick={() => navigator.clipboard.writeText(lead.id)}
                title="Copiar ID"
                className="text-sub hover:text-platinum transition-colors cursor-pointer"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Seletor de Estágio no Funil */}
          <div className="rounded-xl border border-glass-border bg-void/60 p-4 space-y-3">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-sub">
              Estágio Atual do Funil
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onStatusChange?.(lead.id, "new")}
                className={`flex flex-col items-center gap-1 rounded-lg border p-2.5 text-[11px] font-mono transition-all cursor-pointer ${
                  lead.status === "new"
                    ? "border-accent bg-accent text-void font-bold shadow-lg"
                    : "border-glass-border bg-carbon text-sub hover:text-platinum"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Novo Lead</span>
              </button>

              <button
                type="button"
                onClick={() => onStatusChange?.(lead.id, "negotiation")}
                className={`flex flex-col items-center gap-1 rounded-lg border p-2.5 text-[11px] font-mono transition-all cursor-pointer ${
                  lead.status === "negotiation"
                    ? "border-emerald-400 bg-emerald-400/20 text-emerald-400 font-bold shadow-lg"
                    : "border-glass-border bg-carbon text-sub hover:text-platinum"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Negociação</span>
              </button>

              <button
                type="button"
                onClick={() => onStatusChange?.(lead.id, "closed")}
                className={`flex flex-col items-center gap-1 rounded-lg border p-2.5 text-[11px] font-mono transition-all cursor-pointer ${
                  lead.status === "closed"
                    ? "border-accent bg-accent text-void font-bold shadow-lg"
                    : "border-glass-border bg-carbon text-sub hover:text-platinum"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Fechado</span>
              </button>
            </div>
          </div>

          {/* Dados de Contato */}
          <div className="rounded-xl border border-glass-border bg-void/40 p-4 space-y-4">
            <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-platinum">
              Canais de Contato
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-sub mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-sub uppercase block">
                    E-mail Corporativo
                  </span>
                  {lead.leadEmail ? (
                    <a
                      href={`mailto:${lead.leadEmail}`}
                      className="text-platinum hover:text-accent font-mono transition-colors"
                    >
                      {lead.leadEmail}
                    </a>
                  ) : (
                    <span className="text-sub italic">Não informado</span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-sub mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-sub uppercase block">
                    Telefone de Contato
                  </span>
                  {lead.leadPhone ? (
                    <a
                      href={`tel:${lead.leadPhone}`}
                      className="text-platinum hover:text-accent font-mono transition-colors"
                    >
                      {lead.leadPhone}
                    </a>
                  ) : (
                    <span className="text-sub italic">Não informado</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dados de Rastreabilidade e Origem */}
          <div className="rounded-xl border border-glass-border bg-void/40 p-4 space-y-4">
            <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-platinum">
              Inteligência de Captação
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                {isAutomation ? (
                  <Zap className="h-4 w-4 text-amber-300 mt-0.5 shrink-0" />
                ) : (
                  <Globe className="h-4 w-4 text-sub mt-0.5 shrink-0" />
                )}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-sub uppercase block">
                    Canal de Entrada
                  </span>
                  <span className="text-platinum font-mono">
                    {lead.origin || "Direto / Manual"}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-sub mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-sub uppercase block">
                    Data e Hora de Registro
                  </span>
                  <span className="text-platinum font-mono">
                    {formatDate(lead.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="h-4 w-4 text-sub mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-sub uppercase block">
                    Tenant Vinculado
                  </span>
                  <span className="text-platinum font-mono text-[11px]">
                    {lead.companyId}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="pt-4 border-t border-glass-border flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full flex h-10 items-center justify-center rounded-md border border-glass-border bg-carbon text-xs font-semibold text-platinum hover:bg-carbon-muted transition-colors cursor-pointer"
          >
            Fechar Dossiê
          </button>
        </div>
      </div>
    </div>
  );
}
