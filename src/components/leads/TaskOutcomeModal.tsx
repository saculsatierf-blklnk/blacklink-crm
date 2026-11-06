"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  DollarSign,
  Flame,
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
    bestCallTime?: string;
    bestCallDay?: string;
    preferredCallbackWindow?: string;
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
  defaultChannel,
  currentOperatorName = "Lucas de Freitas Leite",
  onSaveOutcome,
}: TaskOutcomeModalProps) {
  const initialChannel: InteractionChannel =
    defaultChannel ||
    (stepTitle?.toLowerCase().includes("wpp") || stepTitle?.toLowerCase().includes("whats")
      ? "whatsapp"
      : stepTitle?.toLowerCase().includes("mail") || stepTitle?.toLowerCase().includes("e-mail")
      ? "email"
      : "call");

  const [channel, setChannel] = useState<InteractionChannel>(initialChannel);
  const [outcome, setOutcome] = useState<InteractionOutcome>(() =>
    initialChannel === "email"
      ? "pediu_email"
      : initialChannel === "whatsapp"
      ? "pediu_whatsapp"
      : "atendeu"
  );
  const [quotedValueStr, setQuotedValueStr] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>(() =>
    inferSectorFromLead(lead)
  );
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inteligência de Horário de Atendimento (Mesmo Dia & Horário)
  const [capturedCallTime, setCapturedCallTime] = useState<string>(() => {
    if (lead.cadenceState?.bestCallTime) return lead.cadenceState.bestCallTime;
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  });

  const [capturedCallDay, setCapturedCallDay] = useState<string>(() => {
    if (lead.cadenceState?.bestCallDay) return lead.cadenceState.bestCallDay;
    const now = new Date();
    const days = [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
    ];
    return days[now.getDay()] || "Segunda-feira";
  });

  const [enableCallbackAlert, setEnableCallbackAlert] = useState<boolean>(true);

  // Troca de canal ajusta automaticamente o desfecho padrão
  const handleSelectChannel = (c: InteractionChannel) => {
    setChannel(c);
    if (c === "email") setOutcome("pediu_email");
    else if (c === "whatsapp") setOutcome("pediu_whatsapp");
    else if (c === "call") setOutcome("atendeu");
  };

  if (!isOpen) return null;

  const leadName = lead.cadenceState?.contactPerson || lead.leadName || "Contato";
  const companyName = lead.cadenceState?.companyName || lead.leadName || "Empresa";

  const calculateCallbackWindow = (timeStr: string) => {
    try {
      const [hStr] = timeStr.split(":");
      const h = parseInt(hStr, 10);
      const startH = Math.max(8, h - 1);
      const endH = Math.min(18, h + 1);
      return `${String(startH).padStart(2, "0")}:00 - ${String(endH).padStart(2, "0")}:00`;
    } catch {
      return `~${timeStr}`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const cleanQuotedVal = quotedValueStr.replace(/\D/g, "");
    const numericQuoted = cleanQuotedVal ? Number(cleanQuotedVal) : undefined;
    const isAnsweredCall = channel === "call" && outcome !== "nao_atendeu";
    const windowStr = isAnsweredCall && enableCallbackAlert ? calculateCallbackWindow(capturedCallTime) : undefined;

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
      bestCallTime: isAnsweredCall && enableCallbackAlert ? capturedCallTime : undefined,
      bestCallDay: isAnsweredCall && enableCallbackAlert ? capturedCallDay : undefined,
      preferredCallbackWindow: windowStr,
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
                onClick={() => handleSelectChannel("call")}
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
                onClick={() => handleSelectChannel("whatsapp")}
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
                onClick={() => handleSelectChannel("email")}
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
                onClick={() => handleSelectChannel("reuniao")}
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

          {/* 2. Desfecho Imediato (Adaptado ao Canal) */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#afafaf] mb-1.5">
              {channel === "email"
                ? "Status do Envio de E-mail"
                : channel === "whatsapp"
                ? "Status do Envio de WhatsApp"
                : "Qual foi o resultado da ligação?"}
            </label>

            {channel === "email" ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setOutcome("pediu_email")}
                  className={`w-full p-3 rounded-lg border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                    outcome === "pediu_email" || outcome === "atendeu"
                      ? "bg-[#0c2b1c] border-[#14d06e] text-white shadow-sm ring-1 ring-[#14d06e]/50"
                      : "bg-[#141414] border-[#2e2e2e] text-[#afafaf] hover:text-white"
                  }`}
                >
                  <Mail className="size-4 text-[#14d06e] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-bold text-white flex items-center justify-between">
                      <span>✓ E-mail Enviado com Sucesso</span>
                      <span className="text-[9px] bg-[#14d06e] text-[#0d0d0d] px-1.5 py-0.5 rounded font-black">PADRÃO</span>
                    </div>
                    <div className="text-[11px] text-[#afafaf] mt-0.5">Disparo realizado com apresentação e catálogo, aguardando retorno</div>
                  </div>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOutcome("solicitou_orcamento")}
                    className={`p-2.5 rounded-lg border text-left flex items-start gap-2 transition-all cursor-pointer ${
                      outcome === "solicitou_orcamento"
                        ? "bg-[#2b2410] border-[#e8c267] text-white shadow-md ring-1 ring-[#e8c267]/50"
                        : "bg-[#141414] border-[#2e2e2e] text-[#afafaf] hover:text-white"
                    }`}
                  >
                    <Target className="size-4 text-[#e8c267] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">Já respondeu / Cotação</div>
                      <div className="text-[10px] text-[#afafaf]">Cliente pediu cotação imediata</div>
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
                      <div className="font-semibold text-white">Prefere WhatsApp</div>
                      <div className="text-[10px] text-[#afafaf]">Pediu envio pelo WhatsApp</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOutcome("sem_email");
                      if (!notes.trim()) {
                        setNotes("Lead sem e-mail cadastrado. Etapa cumprida via direcionamento para WhatsApp.");
                      }
                    }}
                    className={`col-span-2 p-2.5 rounded-lg border text-left flex items-start gap-2 transition-all cursor-pointer ${
                      outcome === "sem_email"
                        ? "bg-[#2b1b0d] border-[#f59e0b] text-white shadow-md ring-1 ring-[#f59e0b]/50"
                        : "bg-[#141414] border-[#2e2e2e] text-[#afafaf] hover:text-white"
                    }`}
                  >
                    <AlertTriangle className="size-4 text-[#f59e0b] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">Lead sem E-mail Cadastrado</div>
                      <div className="text-[10px] text-[#afafaf]">Concluir/pular etapa para destravar o funil e continuar via WhatsApp</div>
                    </div>
                  </button>
                </div>
              </div>
            ) : channel === "whatsapp" ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setOutcome("pediu_whatsapp")}
                  className={`w-full p-3 rounded-lg border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                    outcome === "pediu_whatsapp"
                      ? "bg-[#0c2b1c] border-[#14d06e] text-white shadow-sm ring-1 ring-[#14d06e]/50"
                      : "bg-[#141414] border-[#2e2e2e] text-[#afafaf] hover:text-white"
                  }`}
                >
                  <MessageCircle className="size-4 text-[#14d06e] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-bold text-white flex items-center justify-between">
                      <span>✓ Catálogo / Mensagem Enviada</span>
                      <span className="text-[9px] bg-[#14d06e] text-[#0d0d0d] px-1.5 py-0.5 rounded font-black">PADRÃO</span>
                    </div>
                    <div className="text-[11px] text-[#afafaf] mt-0.5">Disparo realizado via WhatsApp Web</div>
                  </div>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOutcome("solicitou_orcamento")}
                    className={`p-2.5 rounded-lg border text-left flex items-start gap-2 transition-all cursor-pointer ${
                      outcome === "solicitou_orcamento"
                        ? "bg-[#2b2410] border-[#e8c267] text-white shadow-md ring-1 ring-[#e8c267]/50"
                        : "bg-[#141414] border-[#2e2e2e] text-[#afafaf] hover:text-white"
                    }`}
                  >
                    <Target className="size-4 text-[#e8c267] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">Solicitou Orçamento</div>
                      <div className="text-[10px] text-[#afafaf]">Mandou lista de peças</div>
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
                      <div className="font-semibold text-white">Sem retorno</div>
                      <div className="text-[10px] text-[#afafaf]">Mensagem não entregue</div>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              /* Canal de Ligação Telefônica */
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
            )}
          </div>

          {/* Alerta de Retorno Inteligente: Quando o cliente atendeu a ligação */}
          {channel === "call" && outcome !== "nao_atendeu" && (
            <div className="rounded-xl bg-[#0c2b1c]/80 border border-[#14d06e]/30 p-3 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-[#14d06e] font-bold">
                  <Clock className="size-3.5" />
                  <span>Alerta de Retorno (Mesmo Dia &amp; Horário)</span>
                </div>
                <label className="flex items-center gap-1.5 text-[11px] text-[#afafaf] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableCallbackAlert}
                    onChange={(e) => setEnableCallbackAlert(e.target.checked)}
                    className="accent-[#14d06e] rounded"
                  />
                  <span>Ativar alerta no card</span>
                </label>
              </div>

              {enableCallbackAlert && (
                <>
                  <p className="text-[11px] text-[#afafaf] leading-relaxed">
                    Registramos que este cliente atendeu. O card exibirá um alerta em destaque para você retornar por volta de <strong className="text-white font-mono">{capturedCallTime}</strong> ({capturedCallDay}).
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <div>
                      <label className="text-[10px] text-[#afafaf] font-semibold block mb-1">
                        Horário em que atendeu:
                      </label>
                      <input
                        type="time"
                        value={capturedCallTime}
                        onChange={(e) => setCapturedCallTime(e.target.value)}
                        className="w-full bg-[#141414] border border-[#2e2e2e] focus:border-[#14d06e] rounded px-2.5 py-1.5 text-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#afafaf] font-semibold block mb-1">
                        Dia da semana:
                      </label>
                      <select
                        value={capturedCallDay}
                        onChange={(e) => setCapturedCallDay(e.target.value)}
                        className="w-full bg-[#141414] border border-[#2e2e2e] focus:border-[#14d06e] rounded px-2 py-1.5 text-white text-xs cursor-pointer"
                      >
                        <option value="Segunda-feira">Segunda-feira</option>
                        <option value="Terça-feira">Terça-feira</option>
                        <option value="Quarta-feira">Quarta-feira</option>
                        <option value="Quinta-feira">Quinta-feira</option>
                        <option value="Sexta-feira">Sexta-feira</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

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
