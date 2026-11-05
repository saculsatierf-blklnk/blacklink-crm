"use client";

import { useState } from "react";
import {
  Check,
  CheckCircle2,
  DollarSign,
  Mail,
  MessageCircle,
  Phone,
  PhoneCall,
  PhoneMissed,
  Sparkles,
  Target,
  X,
  Zap,
} from "lucide-react";
import type { Lead } from "@/db/schema";
import {
  inferSectorFromLead,
  recordPersonalMetricEvent,
  type InteractionChannel,
  type InteractionOutcome,
} from "@/lib/personalMetrics";

interface TaskOutcomeModalProps {
  isOpen: boolean;
  lead: Lead;
  onClose: () => void;
  stepId?: string;
  stepTitle?: string;
  defaultChannel?: InteractionChannel;
  currentOperatorName?: string;
  onSaveOutcome: (data: {
    outcome: InteractionOutcome;
    channel: InteractionChannel;
    notes?: string;
    quotedValue?: number;
    completedStepId?: string;
  }) => void;
}

const SECTOR_OPTIONS = [
  "Estruturas Metálicas",
  "Serralheria & Esquadrias",
  "Implementos Agrícolas",
  "Caldeiraria & Manutenção",
  "Construção Civil & Montagens",
  "Indústria & Máquinas",
  "Móveis Tubulares & Decoração",
  "Indústria Geral",
];

export function TaskOutcomeModal({
  isOpen,
  lead,
  onClose,
  stepId,
  stepTitle,
  defaultChannel = "call",
  currentOperatorName = "Lucas de Freitas Leite",
  onSaveOutcome,
}: TaskOutcomeModalProps) {
  const [channel, setChannel] = useState<InteractionChannel>(defaultChannel);
  const [outcome, setOutcome] = useState<InteractionOutcome>("atendeu");
  const [quotedValueStr, setQuotedValueStr] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>(() =>
    inferSectorFromLead(lead)
  );
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const leadName = lead.cadenceState?.contactPerson || lead.leadName || "Contato";
  const companyName = lead.cadenceState?.companyName || lead.leadName || "Empresa";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const cleanQuotedVal = quotedValueStr.replace(/\D/g, "");
    const numericQuoted = cleanQuotedVal ? Number(cleanQuotedVal) : undefined;

    // Registra métrica pessoal
    recordPersonalMetricEvent({
      leadId: lead.id,
      leadName,
      companyName,
      sector: selectedSector,
      channel,
      outcome,
      answeredCall: channel === "call" ? outcome !== "nao_atendeu" : true,
      requestedWhatsapp: outcome === "pediu_whatsapp",
      requestedEmail: outcome === "pediu_email",
      quoted: outcome === "solicitou_orcamento",
      quotedValue: numericQuoted,
      stepId,
      stepTitle: stepTitle || (channel === "call" ? "Cold Call" : "Contato"),
      notes: notes.trim() || undefined,
      operatorId: lead.ownerId || "lucas.leite",
      operatorName: currentOperatorName,
    });

    onSaveOutcome({
      outcome,
      channel,
      notes: notes.trim() || undefined,
      quotedValue: numericQuoted,
      completedStepId: stepId,
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative z-50 w-full max-w-lg rounded-xl border border-[#2e2e2e] bg-[#0d0d0d] p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Topo com Título & Fechar */}
        <div className="flex items-start justify-between border-b border-[#2e2e2e] pb-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#14d06e] font-semibold">
              <Zap className="size-3.5" />
              <span>Conclusão de Tarefa &amp; Registro de Métrica</span>
            </div>
            <h3 className="text-base font-bold text-white truncate max-w-sm mt-0.5">
              {companyName}
            </h3>
            <p className="text-xs text-[#afafaf]">
              {stepTitle ? `Passo: ${stepTitle}` : "Registre o resultado para alimentar suas métricas de assertividade"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[#afafaf] hover:bg-[#1a1a1a] hover:text-white transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* 1. Canal Utilizado */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#afafaf] mb-1.5">
              Canal de Interação
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setChannel("call")}
                className={`py-2 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  channel === "call"
                    ? "bg-[#14d06e] text-[#0d0d0d] shadow-sm font-bold"
                    : "bg-[#141414] text-[#afafaf] border border-[#2e2e2e] hover:text-white"
                }`}
              >
                <Phone className="size-3.5" />
                <span>Ligação</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel("whatsapp")}
                className={`py-2 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  channel === "whatsapp"
                    ? "bg-[#14d06e] text-[#0d0d0d] shadow-sm font-bold"
                    : "bg-[#141414] text-[#afafaf] border border-[#2e2e2e] hover:text-white"
                }`}
              >
                <MessageCircle className="size-3.5" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel("email")}
                className={`py-2 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  channel === "email"
                    ? "bg-[#14d06e] text-[#0d0d0d] shadow-sm font-bold"
                    : "bg-[#141414] text-[#afafaf] border border-[#2e2e2e] hover:text-white"
                }`}
              >
                <Mail className="size-3.5" />
                <span>E-mail</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel("reuniao")}
                className={`py-2 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  channel === "reuniao"
                    ? "bg-[#14d06e] text-[#0d0d0d] shadow-sm font-bold"
                    : "bg-[#141414] text-[#afafaf] border border-[#2e2e2e] hover:text-white"
                }`}
              >
                <Sparkles className="size-3.5" />
                <span>Reunião</span>
              </button>
            </div>
          </div>

          {/* 2. Desfecho Imediato (O que aconteceu?) */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#afafaf] mb-1.5">
              Qual foi o resultado imediato?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOutcome("atendeu")}
                className={`p-2.5 rounded-lg border text-left flex items-start gap-2 transition-all cursor-pointer ${
                  outcome === "atendeu"
                    ? "bg-[#0c2b1c] border-[#14d06e] text-white shadow-sm"
                    : "bg-[#141414] border-[#2e2e2e] text-[#afafaf] hover:text-white"
                }`}
              >
                <PhoneCall className="size-4 text-[#14d06e] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Atendeu a ligação</div>
                  <div className="text-[10px] text-[#afafaf]">Conversei com decisor / compras</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOutcome("nao_atendeu")}
                className={`p-2.5 rounded-lg border text-left flex items-start gap-2 transition-all cursor-pointer ${
                  outcome === "nao_atendeu"
                    ? "bg-[#2b1310] border-[#ff5d48] text-white shadow-sm"
                    : "bg-[#141414] border-[#2e2e2e] text-[#afafaf] hover:text-white"
                }`}
              >
                <PhoneMissed className="size-4 text-[#ff5d48] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Não atendeu</div>
                  <div className="text-[10px] text-[#afafaf]">Caixa postal / ocupado / sem sinal</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOutcome("pediu_whatsapp")}
                className={`p-2.5 rounded-lg border text-left flex items-start gap-2 transition-all cursor-pointer ${
                  outcome === "pediu_whatsapp"
                    ? "bg-[#0c2b1c] border-[#14d06e] text-white shadow-sm"
                    : "bg-[#141414] border-[#2e2e2e] text-[#afafaf] hover:text-white"
                }`}
              >
                <MessageCircle className="size-4 text-[#14d06e] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Solicitou WhatsApp</div>
                  <div className="text-[10px] text-[#afafaf]">Pediu para enviar catálogo / tabela</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOutcome("pediu_email")}
                className={`p-2.5 rounded-lg border text-left flex items-start gap-2 transition-all cursor-pointer ${
                  outcome === "pediu_email"
                    ? "bg-[#0f1b33] border-[#7fa9f7] text-white shadow-sm"
                    : "bg-[#141414] border-[#2e2e2e] text-[#afafaf] hover:text-white"
                }`}
              >
                <Mail className="size-4 text-[#7fa9f7] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Solicitou E-mail</div>
                  <div className="text-[10px] text-[#afafaf]">Enviar apresentação formal de tubos</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOutcome("solicitou_orcamento")}
                className={`col-span-2 p-2.5 rounded-lg border text-left flex items-start gap-2 transition-all cursor-pointer ${
                  outcome === "solicitou_orcamento"
                    ? "bg-[#2b2410] border-[#e8c267] text-white shadow-md ring-1 ring-[#e8c267]/50"
                    : "bg-[#141414] border-[#2e2e2e] text-[#afafaf] hover:text-white"
                }`}
              >
                <Target className="size-4 text-[#e8c267] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>Solicitou Cotação / Orçamento!</span>
                    <span className="text-[9px] bg-[#e8c267] text-[#0d0d0d] px-1.5 py-0.2 rounded font-black">QUENTE</span>
                  </div>
                  <div className="text-[10px] text-[#e8c267]">Cliente tem demanda imediata de aço / perfis</div>
                </div>
              </button>
            </div>
          </div>

          {/* Campo condicional de Valor Orçado */}
          {outcome === "solicitou_orcamento" && (
            <div className="rounded-lg bg-[#141414] border border-[#e8c267]/40 p-3 space-y-1.5 animate-in fade-in">
              <label className="block text-[11px] font-semibold text-[#e8c267]">
                Valor Estimado da Demanda / Cotação (R$):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-[#757575] font-mono">R$</span>
                <input
                  type="text"
                  value={quotedValueStr}
                  onChange={(e) => setQuotedValueStr(e.target.value)}
                  placeholder="Ex: 25.000"
                  className="w-full rounded-md border border-[#2e2e2e] bg-[#0a0a0a] pl-10 pr-3 py-1.5 text-xs text-white focus:border-[#e8c267] focus:outline-none font-mono"
                />
              </div>
            </div>
          )}

          {/* 3. Setor / Segmento da Empresa */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#afafaf] mb-1">
              Setor / Nicho de Aço
            </label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full rounded-md border border-[#2e2e2e] bg-[#141414] px-3 py-2 text-xs text-white focus:border-[#14d06e] focus:outline-none cursor-pointer"
            >
              {SECTOR_OPTIONS.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Anotação Rápida */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#afafaf] mb-1">
              Observação da Interação (Histórico)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Falei com o decisor, vai enviar a lista de perfis U e tubos pelo WhatsApp..."
              rows={2}
              className="w-full rounded-md border border-[#2e2e2e] bg-[#0a0a0a] p-2.5 text-xs text-white placeholder:text-[#757575] focus:border-[#14d06e] focus:outline-none"
            />
          </div>

          {/* Rodapé: Cancelar & Salvar */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2e2e2e]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-md text-xs font-semibold text-[#afafaf] hover:text-white hover:bg-[#1a1a1a] transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#14d06e] hover:bg-[#14d06e]/90 text-[#0d0d0d] font-bold px-4 py-2 text-xs transition-colors cursor-pointer shadow-md disabled:opacity-50"
            >
              <Check className="size-3.5 stroke-[3]" />
              <span>Salvar Desfecho &amp; Atualizar Métricas</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
