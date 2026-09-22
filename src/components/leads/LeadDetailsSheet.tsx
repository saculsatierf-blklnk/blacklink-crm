"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRightLeft,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  CheckSquare,
  Clock,
  Coins,
  Copy,
  FileText,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  User,
  UserCheck,
  X,
  Zap,
} from "lucide-react";
import type { Lead, NoteEntry } from "@/db/schema";
import {
  updateLeadCadenceAction,
  addLeadNoteAction,
  deleteLeadNoteAction,
  updateLeadScriptAction,
  updateLeadOwnerAction,
  scheduleLeadActivityAction,
  type LeadStatus,
} from "@/actions/leads";
import {
  CADENCE_STEPS,
  calculateStepTemporalStatus,
  buildDefaultInterpolatedScript,
  parseLeadInfo,
  toStartOfDay,
} from "@/lib/cadence";
import { OPERATORS, getOperator } from "@/lib/operators";

interface LeadDetailsSheetProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (leadId: string, newStatus: LeadStatus) => void;
  onCadenceChange?: (leadId: string, completedStepIds: string[]) => void;
  onOwnerChange?: (leadId: string, newOwnerId: string) => void;
  onActivityScheduled?: (
    leadId: string,
    activityDate: Date,
    activityType: string,
    newOwnerId?: string
  ) => void;
}

export function LeadDetailsSheet({
  lead,
  isOpen,
  onClose,
  onStatusChange,
  onCadenceChange,
  onOwnerChange,
  onActivityScheduled,
}: LeadDetailsSheetProps) {
  const parsed = lead ? parseLeadInfo(lead.leadName) : { name: "", company: "" };

  // Metadados operacionais do Hunter (persistidos no PostgreSQL)
  const [roleTitle, setRoleTitle] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [ownerId, setOwnerId] = useState("lucas.leite");
  const [isEditingMeta, setIsEditingMeta] = useState(false);

  // Checklist de Cadência (persistido no PostgreSQL)
  const [completedCadence, setCompletedCadence] = useState<string[]>([]);

  // Roteiro Operacional de Abordagem (persistido no PostgreSQL)
  const [scriptText, setScriptText] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  // Histórico de Anotações (persistido no PostgreSQL)
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [newNoteText, setNewNoteText] = useState("");

  // Agenda & Hand-off (persistido no PostgreSQL)
  const [activityDate, setActivityDate] = useState("");
  const [activityType, setActivityType] = useState<string>("reuniao");
  const [assignedOperatorId, setAssignedOperatorId] = useState("lucas.leite");
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleFeedback, setScheduleFeedback] = useState<string | null>(null);
  const [currentActivityDate, setCurrentActivityDate] = useState<Date | null>(null);
  const [currentActivityType, setCurrentActivityType] = useState<string | null>(null);

  // Sincronização direta a partir do PostgreSQL ao abrir ou alternar de lead
  useEffect(() => {
    if (!lead) return;

    // 1. Resolução de Metadados Operacionais
    const dbCadenceState = lead.cadenceState || { completedSteps: [] };

    let resolvedRole = dbCadenceState.roleTitle || "";
    let resolvedValue = dbCadenceState.estimatedValue || "";

    if (!resolvedRole || !resolvedValue) {
      if (lead.leadName.includes("Mariana")) {
        resolvedRole = resolvedRole || "Diretora de Operações";
        resolvedValue = resolvedValue || "R$ 45.000,00";
      } else if (lead.leadName.includes("Carlos")) {
        resolvedRole = resolvedRole || "Head de Novos Negócios";
        resolvedValue = resolvedValue || "R$ 120.000,00";
      } else if (lead.leadName.includes("Roberto")) {
        resolvedRole = resolvedRole || "Chief Investment Officer";
        resolvedValue = resolvedValue || "R$ 250.000,00";
      } else {
        resolvedRole = resolvedRole || "Decisor Comercial";
        resolvedValue = resolvedValue || "R$ 60.000,00";
      }
    }

    setRoleTitle(resolvedRole);
    setEstimatedValue(resolvedValue);
    setOwnerId(lead.ownerId || "lucas.leite");

    // 2. Checklist de Cadência
    const currentCompleted = dbCadenceState.completedSteps || [];
    setCompletedCadence(currentCompleted);

    // 3. Roteiro Dinâmico com Interpolação Imediata
    if (dbCadenceState.customScript && dbCadenceState.customScript.trim()) {
      const resolved = dbCadenceState.customScript
        .replace(/{Nome}/g, parsed.name || "Prezado(a)")
        .replace(/{Empresa}/g, parsed.company || "sua organização")
        .replace(/{Cargo}/g, resolvedRole)
        .replace(/{Valor}/g, resolvedValue);
      setScriptText(resolved);
    } else {
      const generated = buildDefaultInterpolatedScript({
        name: parsed.name,
        company: parsed.company,
        role: resolvedRole,
        value: resolvedValue,
      });
      setScriptText(generated);
    }

    // 4. Histórico de Anotações
    setNotes(lead.notes || []);

    // 5. Agendamento de Atividade & Hand-off
    setCurrentActivityDate(lead.nextActivityDate ? new Date(lead.nextActivityDate) : null);
    setCurrentActivityType(lead.nextActivityType || null);
    setAssignedOperatorId(lead.ownerId || "lucas.leite");

    if (lead.nextActivityDate) {
      const d = new Date(lead.nextActivityDate);
      const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setActivityDate(localIso);
      setActivityType(lead.nextActivityType || "reuniao");
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(14, 0, 0, 0);
      const localIso = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setActivityDate(localIso);
      setActivityType("reuniao");
    }
  }, [lead]);

  // Tecla ESC para fechar
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

  // Persistência de Metadados no PostgreSQL
  const handleSaveMeta = async () => {
    setIsEditingMeta(false);
    try {
      await updateLeadCadenceAction(lead.id, {
        roleTitle,
        estimatedValue,
      });
    } catch (error) {
      console.error("Falha ao persistir metadados no banco:", error);
    }
  };

  // Alteração de Dono da Conta (Silo de Propriedade)
  const handleOwnerSelect = async (newOwner: string) => {
    setOwnerId(newOwner);
    onOwnerChange?.(lead.id, newOwner);
    try {
      await updateLeadOwnerAction(lead.id, newOwner);
    } catch (err) {
      console.error("Falha ao atualizar dono da conta:", err);
    }
  };

  // Toggle de etapas de cadência diretamente no PostgreSQL
  const toggleCadenceStep = async (stepId: string) => {
    const next = completedCadence.includes(stepId)
      ? completedCadence.filter((id) => id !== stepId)
      : [...completedCadence, stepId];

    setCompletedCadence(next);
    onCadenceChange?.(lead.id, next);

    try {
      await updateLeadCadenceAction(lead.id, {
        completedSteps: next,
      });
    } catch (error) {
      console.error("Falha ao salvar cadência no banco:", error);
    }
  };

  // Edição e persistência do script diretamente no PostgreSQL
  const handleScriptChange = (newText: string) => {
    setScriptText(newText);
    updateLeadScriptAction(lead.id, newText, lead.scriptVersion).catch((err) =>
      console.error("Falha ao salvar roteiro no banco:", err)
    );
  };

  // Cópia direta do script pronto para uso
  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(scriptText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Restaurar roteiro padrão interpolado
  const handleResetScript = () => {
    const resetText = buildDefaultInterpolatedScript({
      name: parsed.name,
      company: parsed.company,
      role: roleTitle,
      value: estimatedValue,
    });
    handleScriptChange(resetText);
  };

  // Adicionar nova anotação ao histórico relacional no PostgreSQL
  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;

    const notePayload = newNoteText.trim();
    setNewNoteText("");

    const activeOp = getOperator(ownerId);
    const tempNote: NoteEntry = {
      id: "note-" + Date.now(),
      text: notePayload,
      createdAt: new Date().toISOString(),
      author: `${activeOp.name} (${activeOp.role})`,
    };
    setNotes((prev) => [tempNote, ...prev]);

    try {
      const res = await addLeadNoteAction(lead.id, notePayload, tempNote.author);
      if (res.success && res.note) {
        setNotes((prev) =>
          prev.map((n) => (n.id === tempNote.id ? (res.note as NoteEntry) : n))
        );
      }
    } catch (error) {
      console.error("Falha ao salvar nota no banco:", error);
    }
  };

  // Excluir anotação diretamente no PostgreSQL
  const handleDeleteNote = async (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    try {
      await deleteLeadNoteAction(lead.id, noteId);
    } catch (error) {
      console.error("Falha ao excluir nota no banco:", error);
    }
  };

  // Agendamento de Atividade e Passagem de Bastão (Hand-off)
  const handleScheduleActivity = async () => {
    if (!lead || !activityDate) {
      setScheduleFeedback("Selecione data e horário para o compromisso.");
      return;
    }

    setIsScheduling(true);
    setScheduleFeedback(null);

    try {
      const res = await scheduleLeadActivityAction({
        leadId: lead.id,
        activityDate: new Date(activityDate).toISOString(),
        activityType,
        assignedOperatorId,
        currentOperatorId: ownerId,
      });

      if (res.success) {
        const scheduledDateObj = new Date(activityDate);
        setCurrentActivityDate(scheduledDateObj);
        setCurrentActivityType(activityType);

        if (res.isHandOff && res.newOwnerId) {
          setOwnerId(res.newOwnerId);
          onOwnerChange?.(lead.id, res.newOwnerId);
        }

        if (res.note) {
          setNotes((prev) => [res.note as NoteEntry, ...prev]);
        }

        onActivityScheduled?.(
          lead.id,
          scheduledDateObj,
          activityType,
          res.isHandOff ? res.newOwnerId : undefined
        );

        setScheduleFeedback(
          res.isHandOff
            ? `Compromisso agendado e conta transferida para ${getOperator(assignedOperatorId).name}!`
            : "Compromisso agendado com sucesso!"
        );
        setTimeout(() => setScheduleFeedback(null), 4000);
      } else {
        setScheduleFeedback(res.error || "Falha ao agendar atividade.");
      }
    } catch (err) {
      console.error("Erro ao agendar atividade:", err);
      setScheduleFeedback("Erro interno ao processar agendamento.");
    } finally {
      setIsScheduling(false);
    }
  };

  const formatDate = (dateString: string | Date) => {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const formatShortDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    }).format(date);
  };

  const cadenceProgress = Math.round(
    (completedCadence.length / CADENCE_STEPS.length) * 100
  );

  const leadCreatedDay = toStartOfDay(lead.createdAt);
  const currentDay = toStartOfDay(new Date());
  const funnelDays = Math.max(
    0,
    Math.round(
      (currentDay.getTime() - leadCreatedDay.getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop Translúcido com Blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Painel Lateral Slide-over (Dossiê do Hunter) */}
      <div className="relative z-50 flex h-full w-full max-w-xl flex-col justify-between border-l border-glass-border bg-carbon p-6 shadow-2xl sm:p-8 animate-in slide-in-from-right duration-200">
        <div className="space-y-6 overflow-y-auto pr-1">
          {/* 1. TOPO: Cabeçalho com Nome, Empresa, Cargo e Dono */}
          <div className="border-b border-glass-border pb-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center rounded-md border border-glass-border bg-carbon-muted px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest text-sub">
                Dossiê da Conta
              </span>

              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-glass-border bg-carbon-muted text-sub hover:text-platinum hover:border-accent/40 transition-colors cursor-pointer"
                title="Fechar (ESC)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Identificação Principal do Lead */}
            <div>
              <h2 className="text-xl font-bold text-platinum tracking-tight">
                {parsed.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-sub mt-0.5">
                <Building2 className="h-3.5 w-3.5 text-platinum" />
                <span className="font-semibold text-platinum">
                  {parsed.company}
                </span>
              </div>
            </div>

            {/* Grid Operacional: Cargo, Valor Estimado e Dono da Conta */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {/* Cargo / Posição */}
              <div className="rounded-lg border border-glass-border bg-void/60 p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-sub">
                    Cargo / Função
                  </span>
                  <UserCheck className="h-3.5 w-3.5 text-sub" />
                </div>
                {isEditingMeta ? (
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    className="w-full rounded border border-glass-border bg-carbon px-2 py-1 text-xs text-platinum font-mono focus:border-accent focus:outline-none"
                    placeholder="Ex: Diretor de Operações"
                  />
                ) : (
                  <div className="text-xs font-mono font-medium text-platinum truncate">
                    {roleTitle || "Decisor Comercial"}
                  </div>
                )}
              </div>

              {/* Valor Estimado do Contrato */}
              <div className="rounded-lg border border-glass-border bg-void/60 p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-sub">
                    Valor Estimado
                  </span>
                  <Coins className="h-3.5 w-3.5 text-accent" />
                </div>
                {isEditingMeta ? (
                  <input
                    type="text"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(e.target.value)}
                    className="w-full rounded border border-glass-border bg-carbon px-2 py-1 text-xs text-platinum font-mono focus:border-accent focus:outline-none"
                    placeholder="Ex: R$ 45.000,00"
                  />
                ) : (
                  <div className="text-xs font-mono font-bold text-accent truncate">
                    {estimatedValue || "R$ 45.000,00"}
                  </div>
                )}
              </div>

              {/* Dono da Conta (Silo de Propriedade) */}
              <div className="rounded-lg border border-glass-border bg-void/60 p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-sub">
                    Proprietário
                  </span>
                  <User className="h-3.5 w-3.5 text-sub" />
                </div>
                <select
                  value={ownerId}
                  onChange={(e) => handleOwnerSelect(e.target.value)}
                  className="w-full rounded border border-glass-border bg-carbon px-2 py-1 text-xs text-platinum font-mono focus:border-accent focus:outline-none cursor-pointer"
                >
                  {OPERATORS.map((op) => (
                    <option key={op.id} value={op.id} className="bg-carbon text-platinum">
                      {op.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Alternar edição dos metadados */}
            <div className="flex justify-end">
              {isEditingMeta ? (
                <button
                  type="button"
                  onClick={handleSaveMeta}
                  className="text-[11px] font-mono text-accent hover:underline cursor-pointer"
                >
                  Salvar Alterações
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingMeta(true)}
                  className="text-[11px] font-mono text-sub hover:text-platinum transition-colors cursor-pointer"
                >
                  Editar Cargo / Valor
                </button>
              )}
            </div>

            {/* Seletor Rápido de Estágio do Funil */}
            <div className="rounded-lg border border-glass-border bg-void/40 p-3 space-y-2">
              <span className="block text-[10px] font-mono uppercase tracking-wider text-sub">
                Estágio do Lead no Pipeline
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onStatusChange?.(lead.id, "new")}
                  className={`flex flex-col items-center gap-1 rounded-md border p-2 text-[10px] font-mono transition-all cursor-pointer ${
                    lead.status === "new"
                      ? "border-accent bg-accent text-void font-bold shadow-md"
                      : "border-glass-border bg-carbon text-sub hover:text-platinum"
                  }`}
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Novo Lead</span>
                </button>

                <button
                  type="button"
                  onClick={() => onStatusChange?.(lead.id, "negotiation")}
                  className={`flex flex-col items-center gap-1 rounded-md border p-2 text-[10px] font-mono transition-all cursor-pointer ${
                    lead.status === "negotiation"
                      ? "border-emerald-400 bg-emerald-400/20 text-emerald-400 font-bold shadow-md"
                      : "border-glass-border bg-carbon text-sub hover:text-platinum"
                  }`}
                >
                  <Clock className="h-3 w-3" />
                  <span>Em Prospecção</span>
                </button>

                <button
                  type="button"
                  onClick={() => onStatusChange?.(lead.id, "closed")}
                  className={`flex flex-col items-center gap-1 rounded-md border p-2 text-[10px] font-mono transition-all cursor-pointer ${
                    lead.status === "closed"
                      ? "border-accent bg-accent text-void font-bold shadow-md"
                      : "border-glass-border bg-carbon text-sub hover:text-platinum"
                  }`}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Fechado</span>
                </button>
              </div>
            </div>

            {/* Contatos Rápidos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-sub">
              {lead.leadEmail && (
                <a
                  href={`mailto:${lead.leadEmail}`}
                  className="flex items-center gap-1.5 truncate rounded border border-glass-border bg-void/30 p-2 text-platinum hover:border-accent/40 transition-colors"
                >
                  <Mail className="h-3 w-3 text-sub shrink-0" />
                  <span className="truncate">{lead.leadEmail}</span>
                </a>
              )}
              {lead.leadPhone && (
                <a
                  href={`tel:${lead.leadPhone}`}
                  className="flex items-center gap-1.5 truncate rounded border border-glass-border bg-void/30 p-2 text-platinum hover:border-accent/40 transition-colors"
                >
                  <Phone className="h-3 w-3 text-sub shrink-0" />
                  <span className="truncate">{lead.leadPhone}</span>
                </a>
              )}
            </div>
          </div>

          {/* 2. AGENDA & PASSAGEM DE BASTÃO (HAND-OFF) */}
          <div className="rounded-xl border border-glass-border bg-void/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-accent" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-platinum">
                  Agendar Atividade & Hand-off
                </h3>
              </div>

              {currentActivityDate && (
                <span className="inline-flex items-center gap-1.5 rounded border border-glass-border bg-carbon px-2.5 py-1 text-[10px] font-mono text-platinum shadow-sm">
                  <Clock className="h-3 w-3 text-accent" />
                  <span>
                    {currentActivityType === "reuniao"
                      ? "Reunião"
                      : currentActivityType === "call"
                      ? "Ligação"
                      : "Follow-up"}
                    :{" "}
                    {new Intl.DateTimeFormat("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(currentActivityDate)}
                  </span>
                </span>
              )}
            </div>

            <p className="text-[11px] text-sub leading-relaxed">
              Agende o próximo compromisso no calendário. Ao atribuir um operador diferente do atual, a propriedade da conta será transferida automaticamente (Hand-off).
            </p>

            {/* Formulário de Agendamento */}
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Data e Hora */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-sub">
                    Data e Horário
                  </label>
                  <input
                    type="datetime-local"
                    value={activityDate}
                    onChange={(e) => setActivityDate(e.target.value)}
                    className="w-full rounded border border-glass-border bg-carbon px-2.5 py-1.5 text-xs text-platinum font-mono focus:border-accent focus:outline-none"
                  />
                </div>

                {/* Tipo de Atividade */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-sub">
                    Tipo de Compromisso
                  </label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    className="w-full rounded border border-glass-border bg-carbon px-2.5 py-1.5 text-xs text-platinum font-mono focus:border-accent focus:outline-none cursor-pointer"
                  >
                    <option value="reuniao" className="bg-carbon text-platinum">
                      Reunião Executiva (Demonstração)
                    </option>
                    <option value="call" className="bg-carbon text-platinum">
                      Ligação / Call de Qualificação
                    </option>
                    <option value="follow_up" className="bg-carbon text-platinum">
                      Follow-up Comercial
                    </option>
                  </select>
                </div>
              </div>

              {/* Seletor de Operador Responsável (Hand-off) */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-sub">
                  Operador Responsável pela Execução
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {OPERATORS.map((op) => {
                    const isSelected = assignedOperatorId === op.id;
                    const isCurrentOwner = ownerId === op.id;
                    return (
                      <button
                        key={op.id}
                        type="button"
                        onClick={() => setAssignedOperatorId(op.id)}
                        className={`flex flex-col items-start gap-0.5 rounded-lg border p-2 text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-accent bg-carbon-muted text-accent font-semibold shadow-inner"
                            : "border-glass-border bg-carbon text-sub hover:text-platinum hover:bg-carbon-muted/30"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-mono font-medium truncate">
                            {op.shortName}
                          </span>
                          {isCurrentOwner && (
                            <span className="text-[9px] font-mono px-1 rounded bg-void text-sub">
                              Atual
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-sub truncate">{op.role}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Alerta de Hand-off se operador for diferente */}
              {assignedOperatorId !== ownerId && (
                <div className="flex items-center gap-2 rounded-md border border-amber-400/40 bg-amber-400/10 p-2.5 text-xs text-amber-300 font-mono">
                  <ArrowRightLeft className="h-4 w-4 shrink-0 text-amber-300" />
                  <span>
                    <strong>Passagem de Bastão:</strong> A conta será transferida de{" "}
                    <strong>{getOperator(ownerId).name}</strong> para{" "}
                    <strong>{getOperator(assignedOperatorId).name}</strong>.
                  </span>
                </div>
              )}

              {/* Feedback de sucesso ou erro */}
              {scheduleFeedback && (
                <div
                  className={`rounded-md border p-2.5 text-xs font-mono ${
                    scheduleFeedback.includes("sucesso") ||
                    scheduleFeedback.includes("transferida")
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                      : "border-rose-500/40 bg-rose-500/10 text-rose-400"
                  }`}
                >
                  {scheduleFeedback}
                </div>
              )}

              {/* Botão de Confirmação */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  disabled={isScheduling}
                  onClick={handleScheduleActivity}
                  className="flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-xs font-mono font-semibold text-void transition-all hover:bg-accent-hover disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {isScheduling ? (
                    <span>Registrando Compromisso...</span>
                  ) : assignedOperatorId !== ownerId ? (
                    <>
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                      <span>Agendar & Transferir Bastão</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Confirmar Agendamento</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 3. CADÊNCIA TEMPORAL OPERACIONAL */}
          <div className="rounded-xl border border-glass-border bg-void/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-accent" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-platinum">
                  Cadência Temporal de Execução
                </h3>
              </div>
              <span className="text-[11px] font-mono text-platinum font-semibold">
                {completedCadence.length}/{CADENCE_STEPS.length} ({cadenceProgress}%)
              </span>
            </div>

            {/* Barra de Progresso da Cadência */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-carbon-muted">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${cadenceProgress}%` }}
              />
            </div>

            <p className="text-[11px] text-sub leading-relaxed">
              Cronograma operacional de contatos estruturado pelo tempo de entrada no funil.
            </p>

            {/* Lista Interativa de Passos da Cadência */}
            <div className="space-y-2 pt-1">
              {CADENCE_STEPS.map((step) => {
                const isCompleted = completedCadence.includes(step.id);
                const temporalInfo = calculateStepTemporalStatus(
                  lead.createdAt,
                  step.dayOffset,
                  isCompleted
                );
                const isOverdue = !isCompleted && temporalInfo.type === "overdue";
                const isToday = !isCompleted && temporalInfo.type === "today";
                const StepIcon =
                  step.id === "step-1" || step.id === "step-4"
                    ? Phone
                    : step.id === "step-2"
                    ? Mail
                    : step.id === "step-3"
                    ? UserCheck
                    : step.id === "step-5"
                    ? FileText
                    : Clock;

                return (
                  <div
                    key={step.id}
                    onClick={() => toggleCadenceStep(step.id)}
                    className={`flex items-start gap-3 rounded-lg border p-3 transition-all cursor-pointer ${
                      isCompleted
                        ? "border-emerald-500/40 bg-emerald-500/5 text-sub"
                        : temporalInfo.type === "overdue"
                        ? "border-rose-500/50 bg-rose-500/10 hover:border-rose-400"
                        : temporalInfo.type === "today"
                        ? "border-amber-400/60 bg-amber-400/10 hover:border-amber-300"
                        : "border-glass-border bg-carbon hover:border-glass-highlight hover:bg-carbon-muted/30"
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="pt-0.5">
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                          isCompleted
                            ? "border-emerald-400 bg-emerald-400 text-void"
                            : "border-glass-border bg-void"
                        }`}
                      >
                        {isCompleted && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Detalhes do Passo */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <StepIcon
                            className={`h-3.5 w-3.5 ${
                              isCompleted
                                ? "text-emerald-400"
                                : temporalInfo.type === "overdue"
                                ? "text-rose-400"
                                : temporalInfo.type === "today"
                                ? "text-amber-300"
                                : "text-sub"
                            }`}
                          />
                          <span
                            className={`text-xs font-semibold ${
                              isCompleted
                                ? "line-through text-sub"
                                : "text-platinum"
                            }`}
                          >
                            {step.title}
                          </span>
                        </div>

                        {/* Badge de Status Temporal */}
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider font-semibold border ${temporalInfo.badgeClass}`}
                        >
                          {temporalInfo.tag}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-sub font-mono">
                        <span>{step.description}</span>
                        <span>{formatShortDate(temporalInfo.targetDate)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. ROTEIRO OPERACIONAL DE ABORDAGEM */}
          <div className="rounded-xl border border-glass-border bg-void/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-accent" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-platinum">
                  Roteiro de Abordagem do Hunter
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetScript}
                  className="flex items-center gap-1 text-[11px] font-mono text-sub hover:text-platinum transition-colors cursor-pointer"
                  title="Restaurar roteiro padrão"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Restaurar</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyScript}
                  className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-mono font-semibold transition-all cursor-pointer ${
                    isCopied
                      ? "bg-emerald-500 text-void"
                      : "bg-accent text-void hover:bg-accent-hover shadow-sm"
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="h-3 w-3" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copiar Roteiro</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-sub leading-relaxed">
              Mensagem com variáveis interpoladas pronta para envio via WhatsApp ou E-mail.
            </p>

            {/* Textarea do Roteiro */}
            <textarea
              value={scriptText}
              onChange={(e) => handleScriptChange(e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-glass-border bg-carbon p-3 text-xs font-mono text-platinum leading-relaxed focus:border-accent focus:outline-none"
              placeholder="Digite o roteiro da abordagem..."
            />
          </div>

          {/* 4. HISTÓRICO DE ANOTAÇÕES */}
          <div className="rounded-xl border border-glass-border bg-void/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-accent" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-platinum">
                  Histórico de Anotações ({notes.length})
                </h3>
              </div>
            </div>

            {/* Campo para Nova Anotação */}
            <div className="space-y-2">
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Adicionar anotação (ex: decisor em viagem, ligar na terça-feira)..."
                rows={2}
                className="w-full rounded-md border border-glass-border bg-carbon p-2.5 text-xs font-mono text-platinum placeholder:text-sub/50 focus:border-accent focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={!newNoteText.trim()}
                  onClick={handleAddNote}
                  className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-mono font-semibold text-void transition-all hover:bg-accent-hover disabled:opacity-40 cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>Salvar Anotação</span>
                </button>
              </div>
            </div>

            {/* Lista Cronológica de Anotações */}
            <div className="space-y-2 pt-2">
              {notes.length === 0 ? (
                <div className="rounded-md border border-dashed border-glass-border p-4 text-center text-xs text-sub font-mono">
                  Nenhuma anotação registrada ainda.
                </div>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-glass-border bg-carbon p-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-sub">
                        <span className="font-semibold text-platinum">{note.author}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-2.5 w-2.5" />
                          <span>{formatDate(note.createdAt)}</span>
                        </div>
                      </div>
                      <p className="text-xs font-mono text-platinum leading-relaxed whitespace-pre-wrap">
                        {note.text}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-sub/40 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                      title="Excluir Anotação"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Rodapé do Slide-over */}
        <div className="border-t border-glass-border pt-4 flex items-center justify-between text-[11px] font-mono text-sub">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-sub" />
            <span>
              No pipeline há {funnelDays} {funnelDays === 1 ? "dia" : "dias"}
            </span>
          </div>

          <button
            onClick={onClose}
            className="rounded-md border border-glass-border bg-carbon px-4 py-2 text-xs font-mono text-platinum hover:bg-carbon-muted transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
