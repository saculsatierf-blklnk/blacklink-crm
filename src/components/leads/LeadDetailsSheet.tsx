"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
  Edit2,
  FileText,
  ListTodo,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  RotateCcw,
  Send,
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
  updateLeadDetailsAction,
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
import { OPERATORS, getOperator, formatNoteAuthor, type Operator } from "@/lib/operators";
import {
  GOFER_TEMPLATES,
  extractLeadContext,
  interpolateGoferTemplateText,
  type TemplatePhaseKey,
  type TemplateChannel,
} from "@/lib/templates-gofer";

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
  onLeadUpdate?: (updatedLead: Lead) => void;
  operators?: Operator[];
}

export function LeadDetailsSheet({
  lead,
  isOpen,
  onClose,
  onStatusChange,
  onCadenceChange,
  onOwnerChange,
  onActivityScheduled,
  onLeadUpdate,
  operators = OPERATORS,
}: LeadDetailsSheetProps) {
  const parsed = lead ? parseLeadInfo(lead.leadName) : { name: "", company: "" };

  // Estados para edição direta das informações cadastrais e comerciais do lead
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editContactPerson, setEditContactPerson] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRoleTitle, setEditRoleTitle] = useState("");
  const [editEstimatedValue, setEditEstimatedValue] = useState("");
  const [saveDetailsFeedback, setSaveDetailsFeedback] = useState<string | null>(null);

  // Metadados operacionais do Hunter (persistidos no PostgreSQL)
  const [roleTitle, setRoleTitle] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [ownerId, setOwnerId] = useState("lucas.leite");
  const [isEditingMeta, setIsEditingMeta] = useState(false);

  // Checklist de Cadência (persistido no PostgreSQL)
  const [completedCadence, setCompletedCadence] = useState<string[]>([]);

  // Roteiro Operacional & Templates Gofer Metais (Multi-Fase & Multi-Canal)
  const [selectedChannel, setSelectedChannel] = useState<TemplateChannel>("whatsapp");
  const [selectedPhaseKey, setSelectedPhaseKey] = useState<TemplatePhaseKey>("contato_1");
  const [templateSubject, setTemplateSubject] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  const [copiedTarget, setCopiedTarget] = useState<"subject" | "body" | "all" | null>(null);
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
  const [cadenceFilter, setCadenceFilter] = useState<"daily" | "weekly" | "monthly" | "all">("all");

  // Sincronização direta a partir do PostgreSQL ao abrir ou alternar de lead
  useEffect(() => {
    if (!lead) return;

    // 1. Resolução de Metadados Operacionais
    const dbCadenceState = lead.cadenceState || { completedSteps: [] };

    const resolvedRole = dbCadenceState.roleTitle || "";
    const resolvedValue = dbCadenceState.estimatedValue || "";

    setRoleTitle(resolvedRole);
    setEstimatedValue(resolvedValue);
    setOwnerId(lead.ownerId || "lucas.leite");

    // Sincroniza campos de edição direta
    const ctx = extractLeadContext(lead);
    setEditCompanyName(ctx.company);
    setEditContactPerson(ctx.person);
    setEditEmail(lead.leadEmail || "");
    setEditPhone(lead.leadPhone || "");
    setEditRoleTitle(resolvedRole);
    setEditEstimatedValue(resolvedValue);
    setIsEditingDetails(false);
    setSaveDetailsFeedback(null);

    // 2. Checklist de Cadência
    const currentCompleted = dbCadenceState.completedSteps || [];
    setCompletedCadence(currentCompleted);

    // 3. Resolução de Templates Gofer Metais de acordo com a fase do lead
    let initialPhase: TemplatePhaseKey = "contato_1";
    if (lead.status === "negotiation") {
      initialPhase = "contato_2";
    } else if (lead.status === "closed") {
      initialPhase = "orcamento_base";
    }
    setSelectedPhaseKey(initialPhase);

    const tmpl =
      GOFER_TEMPLATES.find((t) => t.key === initialPhase) || GOFER_TEMPLATES[0];

    const initialSubj = interpolateGoferTemplateText(tmpl.email.subject, ctx);
    const initialBody = interpolateGoferTemplateText(
      selectedChannel === "email" ? tmpl.email.body : tmpl.whatsapp.text,
      ctx
    );

    setTemplateSubject(initialSubj);
    setTemplateBody(initialBody);
    setScriptText(initialBody);

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

  // Salvar Informações Cadastrais e Comerciais do Lead (Empresa, Contato, Email, Tel, etc.)
  const handleSaveLeadDetails = async () => {
    if (!lead) return;
    setIsSavingDetails(true);
    setSaveDetailsFeedback(null);

    try {
      const res = await updateLeadDetailsAction({
        leadId: lead.id,
        company: editCompanyName.trim(),
        contactPerson: editContactPerson.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
        roleTitle: editRoleTitle.trim(),
        estimatedValue: editEstimatedValue.trim(),
      });

      if (res.success && res.lead) {
        setRoleTitle(editRoleTitle.trim());
        setEstimatedValue(editEstimatedValue.trim());
        setIsEditingDetails(false);
        setSaveDetailsFeedback("Informações atualizadas com sucesso!");
        setTimeout(() => setSaveDetailsFeedback(null), 3000);

        onLeadUpdate?.(res.lead);

        const updatedCtx = extractLeadContext(res.lead);
        const tmpl =
          GOFER_TEMPLATES.find((t) => t.key === selectedPhaseKey) || GOFER_TEMPLATES[0];
        const newSubj = interpolateGoferTemplateText(tmpl.email.subject, updatedCtx);
        const newBody = interpolateGoferTemplateText(
          selectedChannel === "email" ? tmpl.email.body : tmpl.whatsapp.text,
          updatedCtx
        );
        setTemplateSubject(newSubj);
        setTemplateBody(newBody);
      } else {
        setSaveDetailsFeedback(res.error || "Erro ao salvar informações.");
      }
    } catch (err: any) {
      setSaveDetailsFeedback(err?.message || "Erro de conexão ao salvar.");
    } finally {
      setIsSavingDetails(false);
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

  // Contexto derivado e template ativo do lead
  const leadCtx = lead
    ? extractLeadContext(lead)
    : {
        person: "Cliente",
        company: "sua empresa",
        email: "",
        phone: "",
        cleanPhone: "",
        estimatedValue: "1.850,00",
      };

  const currentTmpl =
    GOFER_TEMPLATES.find((t) => t.key === selectedPhaseKey) || GOFER_TEMPLATES[0];

  const handleSelectChannel = (channel: TemplateChannel) => {
    setSelectedChannel(channel);
    const ctx = extractLeadContext(lead);
    const tmpl =
      GOFER_TEMPLATES.find((t) => t.key === selectedPhaseKey) || GOFER_TEMPLATES[0];
    const newBody = interpolateGoferTemplateText(
      channel === "email" ? tmpl.email.body : tmpl.whatsapp.text,
      ctx
    );
    setTemplateBody(newBody);
    handleScriptChange(newBody);
  };

  const handleSelectPhase = (phaseKey: TemplatePhaseKey) => {
    setSelectedPhaseKey(phaseKey);
    const ctx = extractLeadContext(lead);
    const tmpl =
      GOFER_TEMPLATES.find((t) => t.key === phaseKey) || GOFER_TEMPLATES[0];
    const newSubj = interpolateGoferTemplateText(tmpl.email.subject, ctx);
    const newBody = interpolateGoferTemplateText(
      selectedChannel === "email" ? tmpl.email.body : tmpl.whatsapp.text,
      ctx
    );
    setTemplateSubject(newSubj);
    setTemplateBody(newBody);
    handleScriptChange(newBody);
  };

  const handleCopyTarget = async (
    text: string,
    target: "subject" | "body" | "all"
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTarget(target);
      setTimeout(() => setCopiedTarget(null), 2000);
    } catch {
      // Fallback
    }
  };

  // Restaurar roteiro padrão Gofer Metais para a fase selecionada
  const handleResetScript = () => {
    const ctx = extractLeadContext(lead);
    const tmpl =
      GOFER_TEMPLATES.find((t) => t.key === selectedPhaseKey) || GOFER_TEMPLATES[0];
    const newSubj = interpolateGoferTemplateText(tmpl.email.subject, ctx);
    const newBody = interpolateGoferTemplateText(
      selectedChannel === "email" ? tmpl.email.body : tmpl.whatsapp.text,
      ctx
    );
    setTemplateSubject(newSubj);
    setTemplateBody(newBody);
    handleScriptChange(newBody);
  };

  // Adicionar nova anotação ao histórico relacional no PostgreSQL
  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;

    const notePayload = newNoteText.trim();
    setNewNoteText("");

    const activeOp = getOperator(ownerId);
    const cleanAuthor = formatNoteAuthor(activeOp.name);
    const tempNote: NoteEntry = {
      id: "note-" + Date.now(),
      text: notePayload,
      createdAt: new Date().toISOString(),
      author: cleanAuthor,
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

  const getStepDiffDays = (dayOffset: number) => {
    const targetDate = new Date(leadCreatedDay);
    targetDate.setDate(targetDate.getDate() + dayOffset);
    return Math.round((targetDate.getTime() - currentDay.getTime()) / (1000 * 60 * 60 * 24));
  };

  const dailySteps = CADENCE_STEPS.filter((step) => {
    const diff = getStepDiffDays(step.dayOffset);
    return diff <= 0;
  });

  const weeklySteps = CADENCE_STEPS.filter((step) => {
    const diff = getStepDiffDays(step.dayOffset);
    return diff <= 7;
  });

  const monthlySteps = CADENCE_STEPS.filter((step) => {
    const diff = getStepDiffDays(step.dayOffset);
    return diff <= 30;
  });

  const filteredSteps =
    cadenceFilter === "daily"
      ? (dailySteps.length > 0 ? dailySteps : [CADENCE_STEPS[0]])
      : cadenceFilter === "weekly"
      ? weeklySteps
      : cadenceFilter === "monthly"
      ? monthlySteps
      : CADENCE_STEPS;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop Translúcido com Blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Painel Lateral Slide-over (Dossiê do Hunter) com Física de Mola */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="relative z-50 flex h-full w-full max-w-xl flex-col justify-between border-l border-white/10 bg-[#0A0A0A] p-6 shadow-2xl sm:p-8"
      >
        <div className="space-y-6 overflow-y-auto pr-1">
          {/* 1. TOPO: Cabeçalho com Nome, Empresa, Cargo, Contatos e Edição Imediata */}
          <div className="border-b border-white/10 pb-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                Dossiê da Conta
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingDetails((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                    isEditingDetails
                      ? "bg-white text-[#0d0d0d]"
                      : "border border-[#2e2e2e] bg-[#1a1a1a] text-zinc-300 hover:text-white hover:bg-[#262626]"
                  }`}
                >
                  <Edit2 className="size-3 text-[#14d06e]" />
                  <span>{isEditingDetails ? "Fechar Edição" : "Editar Dados"}</span>
                </button>

                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white hover:border-white/20 transition-colors cursor-pointer"
                  title="Fechar (ESC)"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Alerta de Feedback de Salvamento */}
            {saveDetailsFeedback && (
              <div className="rounded-md bg-[#0c2b1c] border border-[#14d06e]/40 p-2.5 text-xs font-medium text-[#14d06e]">
                ✓ {saveDetailsFeedback}
              </div>
            )}

            {/* FORMULÁRIO DE EDIÇÃO DIRETA DAS INFORMAÇÕES */}
            {isEditingDetails ? (
              <div className="rounded-xl border border-[#14d06e]/30 bg-[#121212] p-4 space-y-3.5 ring-1 ring-[#14d06e]/15 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#2e2e2e] pb-2">
                  <div className="flex items-center gap-2">
                    <Edit2 className="size-3.5 text-[#14d06e]" />
                    <span className="text-xs font-semibold text-white">
                      Editar Informações Cadastrais do Lead
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400">
                    Salva no PostgreSQL e reflete no Kanban
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                      Empresa / Razão Social
                    </label>
                    <input
                      type="text"
                      value={editCompanyName}
                      onChange={(e) => setEditCompanyName(e.target.value)}
                      placeholder="Ex: Sempre Serralheria"
                      className="w-full rounded-md border border-[#2e2e2e] bg-[#0a0a0a] px-3 py-1.5 text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                      Contato / Decisor (Pessoa)
                    </label>
                    <input
                      type="text"
                      value={editContactPerson}
                      onChange={(e) => setEditContactPerson(e.target.value)}
                      placeholder="Ex: Marcos (Comprador)"
                      className="w-full rounded-md border border-[#2e2e2e] bg-[#0a0a0a] px-3 py-1.5 text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                      E-mail de Contato
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="contato@sempreserralheria.com.br"
                      className="w-full rounded-md border border-[#2e2e2e] bg-[#0a0a0a] px-3 py-1.5 text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                      WhatsApp / Telefone
                    </label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="Ex: (19) 93395-1795"
                      className="w-full rounded-md border border-[#2e2e2e] bg-[#0a0a0a] px-3 py-1.5 text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                      Cargo / Função
                    </label>
                    <input
                      type="text"
                      value={editRoleTitle}
                      onChange={(e) => setEditRoleTitle(e.target.value)}
                      placeholder="Ex: Comprador / Serralheiro"
                      className="w-full rounded-md border border-[#2e2e2e] bg-[#0a0a0a] px-3 py-1.5 text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                      Valor Estimado (R$)
                    </label>
                    <input
                      type="text"
                      value={editEstimatedValue}
                      onChange={(e) => setEditEstimatedValue(e.target.value)}
                      placeholder="Ex: R$ 25.000,00"
                      className="w-full rounded-md border border-[#2e2e2e] bg-[#0a0a0a] px-3 py-1.5 text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2e2e2e]">
                  <button
                    type="button"
                    onClick={() => setIsEditingDetails(false)}
                    className="rounded-md border border-[#2e2e2e] bg-[#0d0d0d] px-3 py-1.5 text-xs text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={isSavingDetails}
                    onClick={handleSaveLeadDetails}
                    className="inline-flex items-center gap-1.5 rounded-md bg-white hover:bg-white/90 text-[#0d0d0d] font-semibold px-4 py-1.5 text-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSavingDetails ? (
                      <span>Salvando...</span>
                    ) : (
                      <>
                        <Check className="size-3.5" />
                        <span>Salvar Informações</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Identificação Principal do Lead (Modo Leitura com Edição Rápida) */}
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {editCompanyName || parsed.company || parsed.name}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                    <User className="h-3.5 w-3.5 text-[#14d06e]" />
                    <span className="font-semibold text-zinc-200">
                      {editContactPerson
                        ? `Contato: ${editContactPerson}`
                        : parsed.name && parsed.name !== parsed.company
                        ? `Contato: ${parsed.name}`
                        : "Contato não definido (clique em Editar Dados)"}
                    </span>
                  </div>
                </div>

                {/* Grid Operacional: Cargo, Valor Estimado e Dono da Conta */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {/* Cargo / Posição */}
                  <div
                    onClick={() => setIsEditingDetails(true)}
                    className="rounded-lg border border-white/10 bg-black/30 p-3 space-y-1 hover:border-white/30 transition-colors cursor-pointer group"
                    title="Clique para editar"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                        Cargo / Função
                      </span>
                      <UserCheck className="h-3.5 w-3.5 text-zinc-400 group-hover:text-white" />
                    </div>
                    <div className="text-xs font-mono font-medium text-white truncate">
                      {editRoleTitle || roleTitle || "A definir"}
                    </div>
                  </div>

                  {/* Valor Estimado do Contrato */}
                  <div
                    onClick={() => setIsEditingDetails(true)}
                    className="rounded-lg border border-white/10 bg-black/30 p-3 space-y-1 hover:border-white/30 transition-colors cursor-pointer group"
                    title="Clique para editar"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                        Valor Estimado
                      </span>
                      <Coins className="h-3.5 w-3.5 text-accent" />
                    </div>
                    <div className="text-xs font-mono font-bold text-accent truncate">
                      {editEstimatedValue || estimatedValue || "A Definir"}
                    </div>
                  </div>

                  {/* Dono da Conta (Silo de Propriedade) */}
                  <div className="rounded-lg border border-white/10 bg-black/30 p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                        Proprietário
                      </span>
                      <User className="h-3.5 w-3.5 text-zinc-400" />
                    </div>
                    <select
                      value={ownerId}
                      onChange={(e) => handleOwnerSelect(e.target.value)}
                      className="w-full rounded border border-white/10 bg-[#0A0A0A] px-2 py-1 text-xs text-white font-mono focus:border-white/30 focus:outline-none cursor-pointer"
                    >
                      {operators.map((op) => (
                        <option key={op.id} value={op.id} className="bg-[#0A0A0A] text-white">
                          {op.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Contatos Rápidos (E-mail e WhatsApp com botão direto) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-zinc-400 pt-1">
                  {editEmail ? (
                    <div className="flex items-center justify-between rounded border border-white/10 bg-black/20 p-2 text-white">
                      <a
                        href={`mailto:${editEmail}`}
                        className="flex items-center gap-1.5 truncate text-white hover:underline"
                        title="Enviar e-mail"
                      >
                        <Mail className="h-3 w-3 text-zinc-400 shrink-0" />
                        <span className="truncate">{editEmail}</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setIsEditingDetails(true)}
                        className="text-zinc-500 hover:text-white ml-1 p-0.5"
                        title="Editar e-mail"
                      >
                        <Edit2 className="size-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingDetails(true)}
                      className="flex items-center gap-1.5 rounded border border-dashed border-[#2e2e2e] bg-black/20 p-2 text-zinc-400 hover:text-white hover:border-white/30 transition-colors cursor-pointer text-left"
                    >
                      <Mail className="h-3 w-3 text-zinc-500 shrink-0" />
                      <span>+ Inserir E-mail</span>
                    </button>
                  )}

                  {editPhone ? (
                    <div className="flex items-center justify-between rounded border border-white/10 bg-black/20 p-2 text-white">
                      <a
                        href={`tel:${editPhone}`}
                        className="flex items-center gap-1.5 truncate text-white hover:underline"
                        title="Ligar"
                      >
                        <Phone className="h-3 w-3 text-zinc-400 shrink-0" />
                        <span className="truncate">{editPhone}</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setIsEditingDetails(true)}
                        className="text-zinc-500 hover:text-white ml-1 p-0.5"
                        title="Editar telefone"
                      >
                        <Edit2 className="size-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingDetails(true)}
                      className="flex items-center gap-1.5 rounded border border-dashed border-[#2e2e2e] bg-black/20 p-2 text-zinc-400 hover:text-white hover:border-white/30 transition-colors cursor-pointer text-left"
                    >
                      <Phone className="h-3 w-3 text-zinc-500 shrink-0" />
                      <span>+ Inserir WhatsApp / Telefone</span>
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Seletor Rápido de Estágio do Funil */}
            <div className="rounded-lg border border-white/10 bg-black/20 p-3 space-y-2">
              <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                Estágio do Lead no Pipeline
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onStatusChange?.(lead.id, "new")}
                  className={`flex flex-col items-center gap-1 rounded-md border p-2 text-[10px] font-mono transition-all cursor-pointer ${
                    lead.status === "new"
                      ? "border-white/30 bg-accent text-void font-bold shadow-md"
                      : "border-white/10 bg-[#0A0A0A] text-zinc-400 hover:text-white"
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
                      : "border-white/10 bg-[#0A0A0A] text-zinc-400 hover:text-white"
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
                      ? "border-white/30 bg-accent text-void font-bold shadow-md"
                      : "border-white/10 bg-[#0A0A0A] text-zinc-400 hover:text-white"
                  }`}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Fechado</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. AGENDA & PASSAGEM DE BASTÃO (HAND-OFF) */}
          <div className="rounded-xl border border-white/10 bg-black/25 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-accent" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                  Agendar Atividade & Hand-off
                </h3>
              </div>

              {currentActivityDate && (
                <span className="inline-flex items-center gap-1.5 rounded border border-white/10 bg-[#0A0A0A] px-2.5 py-1 text-[10px] font-mono text-white shadow-sm">
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

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Agende o próximo compromisso no calendário. Ao atribuir um operador diferente do atual, a propriedade da conta será transferida automaticamente (Hand-off).
            </p>

            {/* Formulário de Agendamento */}
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Data e Hora */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                    Data e Horário
                  </label>
                  <input
                    type="datetime-local"
                    value={activityDate}
                    onChange={(e) => setActivityDate(e.target.value)}
                    className="w-full rounded border border-white/10 bg-[#0A0A0A] px-2.5 py-1.5 text-xs text-white font-mono focus:border-white/30 focus:outline-none"
                  />
                </div>

                {/* Tipo de Atividade */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                    Tipo de Compromisso
                  </label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    className="w-full rounded border border-white/10 bg-[#0A0A0A] px-2.5 py-1.5 text-xs text-white font-mono focus:border-white/30 focus:outline-none cursor-pointer"
                  >
                    <option value="reuniao" className="bg-[#0A0A0A] text-white">
                      Reunião Executiva (Demonstração)
                    </option>
                    <option value="call" className="bg-[#0A0A0A] text-white">
                      Ligação / Call de Qualificação
                    </option>
                    <option value="follow_up" className="bg-[#0A0A0A] text-white">
                      Follow-up Comercial
                    </option>
                  </select>
                </div>
              </div>

              {/* Seletor de Operador Responsável (Hand-off) */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  Operador Responsável pela Execução
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {operators.map((op) => {
                    const isSelected = assignedOperatorId === op.id;
                    const isCurrentOwner = ownerId === op.id;
                    return (
                      <button
                        key={op.id}
                        type="button"
                        onClick={() => setAssignedOperatorId(op.id)}
                        className={`flex flex-col items-start gap-0.5 rounded-lg border p-2 text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-white/30 bg-white/[0.04] text-accent font-semibold shadow-inner"
                            : "border-white/10 bg-[#0A0A0A] text-zinc-400 hover:text-white hover:bg-white/[0.04]/30"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-mono font-medium truncate">
                            {op.shortName}
                          </span>
                          {isCurrentOwner && (
                            <span className="text-[9px] font-mono px-1 rounded bg-black/40 text-zinc-400">
                              Atual
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-400 truncate">{op.role}</span>
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

          {/* 3. CADÊNCIA TEMPORAL OPERACIONAL (ESTILO APPLE REMINDERS / TAREFAS IPHONE) */}
          <div className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-accent" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                  Cadência Temporal de Execução
                </h3>
              </div>
              <span className="text-[11px] font-mono text-white font-semibold">
                {completedCadence.length}/{CADENCE_STEPS.length} ({cadenceProgress}%)
              </span>
            </div>

            {/* Barra de Progresso da Cadência */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${cadenceProgress}%` }}
              />
            </div>

            {/* Seletor Temporal Segmentado Estilo iOS */}
            <div className="grid grid-cols-4 gap-1 rounded-xl bg-white/[0.04]/70 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setCadenceFilter("daily")}
                className={`flex flex-col items-center justify-center rounded-lg py-1.5 px-1 text-center transition-all cursor-pointer ${
                  cadenceFilter === "daily"
                    ? "bg-accent text-void font-bold shadow-md"
                    : "text-zinc-400 hover:text-white hover:bg-[#0A0A0A]/60"
                }`}
              >
                <span className="text-[10px] font-mono uppercase tracking-wider">Hoje</span>
                <span className="text-[11px] font-semibold">{dailySteps.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setCadenceFilter("weekly")}
                className={`flex flex-col items-center justify-center rounded-lg py-1.5 px-1 text-center transition-all cursor-pointer ${
                  cadenceFilter === "weekly"
                    ? "bg-accent text-void font-bold shadow-md"
                    : "text-zinc-400 hover:text-white hover:bg-[#0A0A0A]/60"
                }`}
              >
                <span className="text-[10px] font-mono uppercase tracking-wider">Semanal</span>
                <span className="text-[11px] font-semibold">{weeklySteps.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setCadenceFilter("monthly")}
                className={`flex flex-col items-center justify-center rounded-lg py-1.5 px-1 text-center transition-all cursor-pointer ${
                  cadenceFilter === "monthly"
                    ? "bg-accent text-void font-bold shadow-md"
                    : "text-zinc-400 hover:text-white hover:bg-[#0A0A0A]/60"
                }`}
              >
                <span className="text-[10px] font-mono uppercase tracking-wider">Mensal</span>
                <span className="text-[11px] font-semibold">{monthlySteps.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setCadenceFilter("all")}
                className={`flex flex-col items-center justify-center rounded-lg py-1.5 px-1 text-center transition-all cursor-pointer ${
                  cadenceFilter === "all"
                    ? "bg-accent text-void font-bold shadow-md"
                    : "text-zinc-400 hover:text-white hover:bg-[#0A0A0A]/60"
                }`}
              >
                <span className="text-[10px] font-mono uppercase tracking-wider">Cadeia</span>
                <span className="text-[11px] font-semibold">{CADENCE_STEPS.length}</span>
              </button>
            </div>

            {/* Lista Estilo Apple Reminders (iPhone) */}
            <div className="rounded-xl border border-white/10 bg-[#0A0A0A] divide-y divide-glass-border/40 overflow-hidden shadow-inner">
              {filteredSteps.length === 0 ? (
                <div className="p-6 text-center space-y-2">
                  <CheckCircle2 className="h-6 w-6 text-zinc-400/50 mx-auto" />
                  <p className="text-xs text-zinc-400">Nenhuma tarefa pendente para este período.</p>
                  <button
                    type="button"
                    onClick={() => setCadenceFilter("all")}
                    className="text-xs font-mono text-accent hover:underline cursor-pointer"
                  >
                    Ver cadeia completa de prospecção &rarr;
                  </button>
                </div>
              ) : (
                filteredSteps.map((step) => {
                  const isCompleted = completedCadence.includes(step.id);
                  const temporalInfo = calculateStepTemporalStatus(
                    lead.createdAt,
                    step.dayOffset,
                    isCompleted
                  );

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
                      className={`group flex items-center justify-between gap-3.5 p-3.5 transition-colors cursor-pointer ${
                        isCompleted
                          ? "bg-[#0A0A0A]/30 opacity-70 hover:opacity-100"
                          : "hover:bg-white/[0.04]/40"
                      }`}
                    >
                      {/* Botão de Check Circular Apple Style */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                            isCompleted
                              ? "border-emerald-500 bg-emerald-500 text-void shadow-sm"
                              : "border-sub/50 group-hover:border-white/30 group-hover:bg-white/5"
                          }`}
                        >
                          {isCompleted && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>

                        {/* Conteúdo da Linha */}
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-medium tracking-tight ${
                                isCompleted
                                  ? "line-through text-zinc-400"
                                  : "text-white group-hover:text-accent"
                              }`}
                            >
                              {step.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400/70 truncate">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      {/* Metadados à Direita: Canal e Status Temporal */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
                          <StepIcon className="h-3 w-3 text-zinc-400/80" />
                          <span className="hidden sm:inline">{step.shortAction}</span>
                        </div>

                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider font-semibold border ${temporalInfo.badgeClass}`}
                        >
                          {temporalInfo.tag}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 3. TEMPLATES & ROTEIROS DE PROSPECÇÃO GOFER METAIS */}
          <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3.5 ring-1 ring-white/5">
            {/* Cabeçalho do Roteiro */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#14d06e]" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Templates Gofer Metais
                  </h3>
                  <p className="text-[10px] text-zinc-400">
                    Adaptado para <strong className="text-white">{leadCtx.person}</strong> ({leadCtx.company})
                  </p>
                </div>
              </div>

              {/* Seletor de Canal (WhatsApp vs E-mail) */}
              <div className="inline-flex rounded-lg bg-[#0d0d0d] p-0.5 ring-1 ring-[#2e2e2e]">
                <button
                  type="button"
                  onClick={() => handleSelectChannel("whatsapp")}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                    selectedChannel === "whatsapp"
                      ? "bg-[#14d06e] text-[#0d0d0d] shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <MessageSquare className="size-3" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectChannel("email")}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                    selectedChannel === "email"
                      ? "bg-white text-[#0d0d0d] shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Mail className="size-3" />
                  <span>E-mail</span>
                </button>
              </div>
            </div>

            {/* Pílulas de Seleção de Fase do Cliente */}
            <div className="flex flex-wrap gap-1.5">
              {GOFER_TEMPLATES.map((tmpl) => {
                const isSelected = tmpl.key === selectedPhaseKey;
                const isRecommended = tmpl.defaultForStatus === lead.status;
                return (
                  <button
                    key={tmpl.key}
                    type="button"
                    onClick={() => handleSelectPhase(tmpl.key)}
                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white text-[#0d0d0d] font-semibold ring-1 ring-white"
                        : "bg-[#1a1a1a] text-zinc-400 hover:text-white ring-1 ring-[#2e2e2e] hover:bg-[#262626]"
                    }`}
                  >
                    <span>{tmpl.badge}</span>
                    {isRecommended && (
                      <span className="inline-block size-1.5 rounded-full bg-[#14d06e]" title="Fase atual do lead" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Objetivo da Fase Selecionada */}
            <div className="rounded-md bg-[#0d0d0d] px-3 py-2 ring-1 ring-[#2e2e2e] text-[11px] text-zinc-400 flex items-center justify-between gap-2">
              <span className="line-clamp-1">
                🎯 {selectedChannel === "whatsapp" ? currentTmpl.whatsapp.objective : currentTmpl.subtitle}
              </span>
              <button
                type="button"
                onClick={handleResetScript}
                className="text-[10px] text-zinc-400 hover:text-white inline-flex items-center gap-1 shrink-0 cursor-pointer"
                title="Restaurar texto padrão da Gofer Metais"
              >
                <RotateCcw className="size-3" />
                <span>Restaurar</span>
              </button>
            </div>

            {/* Campos de Conteúdo */}
            {selectedChannel === "email" ? (
              <div className="space-y-2.5">
                {/* Linha de Assunto */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                      Assunto do E-mail
                    </label>
                    <button
                      type="button"
                      onClick={() => handleCopyTarget(templateSubject, "subject")}
                      className="text-[10px] text-zinc-400 hover:text-white inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedTarget === "subject" ? (
                        <>
                          <Check className="size-3 text-[#14d06e]" />
                          <span className="text-[#14d06e]">Assunto Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3" />
                          <span>Copiar Assunto</span>
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={templateSubject}
                    onChange={(e) => setTemplateSubject(e.target.value)}
                    className="w-full rounded-md border border-white/10 bg-[#0A0A0A] px-3 py-2 text-xs font-mono text-white focus:border-white/30 focus:outline-none"
                  />
                </div>

                {/* Corpo do E-mail */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    Mensagem do E-mail
                  </label>
                  <textarea
                    value={templateBody}
                    onChange={(e) => {
                      setTemplateBody(e.target.value);
                      handleScriptChange(e.target.value);
                    }}
                    rows={8}
                    className="w-full rounded-md border border-white/10 bg-[#0A0A0A] p-3 text-xs font-mono text-white leading-relaxed focus:border-white/30 focus:outline-none"
                    placeholder="Corpo do e-mail..."
                  />
                </div>

                {/* Barra de Ações do E-mail */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyTarget(
                        `Assunto: ${templateSubject}\n\n${templateBody}`,
                        "all"
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-3 py-1.5 text-xs font-semibold text-white cursor-pointer"
                  >
                    {copiedTarget === "all" ? (
                      <>
                        <Check className="size-3 text-[#14d06e]" />
                        <span className="text-[#14d06e]">E-mail Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        <span>Copiar E-mail Completo</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`mailto:${leadCtx.email}?subject=${encodeURIComponent(
                      templateSubject
                    )}&body=${encodeURIComponent(templateBody)}`}
                    className="inline-flex items-center gap-1.5 rounded-md bg-white hover:bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-[#0d0d0d] cursor-pointer"
                  >
                    <Send className="size-3" />
                    <span>Abrir Webmail / Enviar E-mail ↗</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Mensagem do WhatsApp */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    Mensagem de WhatsApp
                  </label>
                  <textarea
                    value={templateBody}
                    onChange={(e) => {
                      setTemplateBody(e.target.value);
                      handleScriptChange(e.target.value);
                    }}
                    rows={5}
                    className="w-full rounded-md border border-white/10 bg-[#0A0A0A] p-3 text-xs font-mono text-white leading-relaxed focus:border-white/30 focus:outline-none"
                    placeholder="Mensagem do WhatsApp..."
                  />
                </div>

                {/* Barra de Ações do WhatsApp */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleCopyTarget(templateBody, "body")}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-3 py-1.5 text-xs font-semibold text-white cursor-pointer"
                  >
                    {copiedTarget === "body" ? (
                      <>
                        <Check className="size-3 text-[#14d06e]" />
                        <span className="text-[#14d06e]">Mensagem Copiada!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        <span>Copiar Mensagem</span>
                      </>
                    )}
                  </button>

                  <a
                    href={
                      leadCtx.cleanPhone
                        ? `https://wa.me/${leadCtx.cleanPhone}?text=${encodeURIComponent(
                            templateBody
                          )}`
                        : `https://web.whatsapp.com/send?text=${encodeURIComponent(
                            templateBody
                          )}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#14d06e] hover:bg-[#14d06e]/90 px-3.5 py-1.5 text-xs font-semibold text-[#0d0d0d] cursor-pointer"
                  >
                    <MessageSquare className="size-3" />
                    <span>Abrir no WhatsApp Web ↗</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* 4. HISTÓRICO DE ANOTAÇÕES */}
          <div className="rounded-xl border border-white/10 bg-black/25 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-accent" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
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
                className="w-full rounded-md border border-white/10 bg-[#0A0A0A] p-2.5 text-xs font-mono text-white placeholder:text-zinc-400/50 focus:border-white/30 focus:outline-none"
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
                <div className="rounded-md border border-dashed border-white/10 p-4 text-center text-xs text-zinc-400 font-mono">
                  Nenhuma anotação registrada ainda.
                </div>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-white/10 bg-[#0A0A0A] p-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                        <span className="font-semibold text-white">{formatNoteAuthor(note.author)}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-2.5 w-2.5" />
                          <span>{formatDate(note.createdAt)}</span>
                        </div>
                      </div>
                      <p className="text-xs font-mono text-white leading-relaxed whitespace-pre-wrap">
                        {note.text}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-zinc-400/40 hover:text-rose-400 transition-colors p-1 cursor-pointer"
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
        <div className="border-t border-white/10 pt-4 flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-zinc-400" />
            <span>
              No pipeline há {funnelDays} {funnelDays === 1 ? "dia" : "dias"}
            </span>
          </div>

          <button
            onClick={onClose}
            className="rounded-md border border-white/10 bg-[#0A0A0A] px-4 py-2 text-xs font-mono text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
