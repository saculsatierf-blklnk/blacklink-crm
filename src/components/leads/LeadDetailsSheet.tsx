"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  Ban,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  Copy,
  Edit2,
  ExternalLink,
  FileText,
  ListTodo,
  Mail,
  MapPin,
  MessageCircle,
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
} from "lucide-react";
import type { Lead, NoteEntry } from "@/db/schema";
import {
  updateLeadCadenceAction,
  updateLeadDetailsAction,
  addLeadNoteAction,
  deleteLeadNoteAction,
  scheduleLeadActivityAction,
  deactivateLeadAction,
  reactivateLeadAction,
  type LeadStatus,
} from "@/actions/leads";
import {
  CADENCE_STEPS,
  calculateStepTemporalStatus,
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
  onLeadUpdate,
  operators = OPERATORS,
}: LeadDetailsSheetProps) {
  // 1. Estados dos 6 campos diretos do Lead (Empresa, Decisor, Número, WhatsApp, E-mail, Localização)
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editContactPerson, setEditContactPerson] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editRoleTitle, setEditRoleTitle] = useState("");
  const [editEstimatedValue, setEditEstimatedValue] = useState("");

  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // 2. Aba ativa inferior
  const [activeBottomTab, setActiveBottomTab] = useState<
    "interacoes" | "proximos_passos" | "templates"
  >("interacoes");

  // 3. Histórico de Anotações ("O que aconteceu nesta interação?")
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  // 4. Próximos Passos de Prospecção & Cadência
  const [completedCadence, setCompletedCadence] = useState<string[]>([]);
  const [cadenceFilter, setCadenceFilter] = useState<"daily" | "weekly" | "monthly" | "all">("all");
  const [activityDate, setActivityDate] = useState("");
  const [activityType, setActivityType] = useState<string>("follow_up");
  const [isSavingNextStep, setIsSavingNextStep] = useState(false);
  const [nextStepFeedback, setNextStepFeedback] = useState<string | null>(null);

  // 5. Templates Gofer Metais
  const [selectedChannel, setSelectedChannel] = useState<TemplateChannel>("whatsapp");
  const [selectedPhaseKey, setSelectedPhaseKey] = useState<TemplatePhaseKey>("contato_1");
  const [templateSubject, setTemplateSubject] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  const [copiedTarget, setCopiedTarget] = useState<"subject" | "body" | "all" | null>(null);

  // 6. Desativação & Reativação do Lead
  const [isLeadDeactivated, setIsLeadDeactivated] = useState(false);
  const [deactivationReason, setDeactivationReason] = useState("");
  const [deactivatedAt, setDeactivatedAt] = useState("");
  const [deactivatedBy, setDeactivatedBy] = useState("");
  const [deactivationHistory, setDeactivationHistory] = useState<any[]>([]);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isReactivateModalOpen, setIsReactivateModalOpen] = useState(false);
  const [deactivateReasonInput, setDeactivateReasonInput] = useState("");
  const [reactivateNoteInput, setReactivateNoteInput] = useState("");
  const [isSubmittingDeactivation, setIsSubmittingDeactivation] = useState(false);
  const [isSubmittingReactivation, setIsSubmittingReactivation] = useState(false);

  // Sincronização direta ao carregar o lead
  useEffect(() => {
    if (!lead) return;

    const ctx = extractLeadContext(lead);
    const dbCadenceState = (lead.cadenceState as any) || {};

    // Desativação / Auditoria
    setIsLeadDeactivated(Boolean(dbCadenceState.isDeactivated));
    setDeactivationReason(dbCadenceState.deactivationReason || "");
    setDeactivatedAt(dbCadenceState.deactivatedAt || "");
    setDeactivatedBy(dbCadenceState.deactivatedBy || "");
    setDeactivationHistory(dbCadenceState.deactivationHistory || []);
    setIsDeactivateModalOpen(false);
    setIsReactivateModalOpen(false);
    setDeactivateReasonInput("");
    setReactivateNoteInput("");

    const comp = dbCadenceState.companyName || ctx.company || "";
    const person = dbCadenceState.contactPerson || ctx.person || "";
    const rawPh = dbCadenceState.phone || lead.leadPhone || "";
    const wpp = dbCadenceState.whatsapp || lead.leadPhone || "";
    const mail = lead.leadEmail || "";
    const loc = dbCadenceState.location || "";
    const role = dbCadenceState.roleTitle || "";
    const val = dbCadenceState.estimatedValue || "";

    setEditCompanyName(comp);
    setEditContactPerson(person);
    setEditPhone(rawPh);
    setEditWhatsapp(wpp);
    setEditEmail(mail);
    setEditLocation(loc);
    setEditRoleTitle(role);
    setEditEstimatedValue(val);
    setSaveFeedback(null);

    // Anotações
    setNotes(lead.notes || []);

    // Cadência de prospecção
    setCompletedCadence(dbCadenceState.completedSteps || []);

    // Próximo passo
    if (lead.nextActivityDate) {
      const d = new Date(lead.nextActivityDate);
      const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setActivityDate(localIso);
      setActivityType(lead.nextActivityType || "follow_up");
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(14, 0, 0, 0);
      const localIso = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setActivityDate(localIso);
      setActivityType("follow_up");
    }

    // Templates
    let initialPhase: TemplatePhaseKey = "contato_1";
    if (lead.status === "negotiation") initialPhase = "contato_2";
    else if (lead.status === "closed") initialPhase = "orcamento_base";
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
  }, [lead, selectedChannel]);

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

  const leadCtx = extractLeadContext(lead);
  const cleanWhatsappDigits = (editWhatsapp || editPhone || "")
    .replace(/\D/g, "");
  const formattedWhatsappUrl = cleanWhatsappDigits
    ? `https://wa.me/${cleanWhatsappDigits.length >= 10 && cleanWhatsappDigits.length <= 11 ? `55${cleanWhatsappDigits}` : cleanWhatsappDigits}`
    : "";

  // 1. Salvar Informações Cadastrais (Empresa, Contato, Telefone, WhatsApp, E-mail, Localização)
  const handleSaveLeadDetails = async () => {
    if (!lead) return;
    setIsSavingDetails(true);
    setSaveFeedback(null);

    const cleanCompany = editCompanyName.trim() || "Lead";
    const cleanPerson = editContactPerson.trim();
    const cleanEmail = editEmail.trim();
    const cleanPhone = editPhone.trim();
    const cleanWhatsapp = editWhatsapp.trim() || cleanPhone;
    const cleanLocation = editLocation.trim();
    const cleanRoleTitle = editRoleTitle.trim();
    const cleanEstimatedValue = editEstimatedValue.trim();

    const resolvedName =
      cleanPerson && cleanCompany
        ? `${cleanPerson} (${cleanCompany})`
        : cleanCompany || cleanPerson;

    // Atualização otimista imediata
    const optimisticLead: Lead = {
      ...lead,
      leadName: resolvedName,
      leadEmail: cleanEmail || null,
      leadPhone: cleanWhatsapp || cleanPhone || null,
      cadenceState: {
        ...(lead.cadenceState || { completedSteps: [] }),
        roleTitle: cleanRoleTitle,
        estimatedValue: cleanEstimatedValue,
        location: cleanLocation,
        companyName: cleanCompany,
        contactPerson: cleanPerson,
        phone: cleanPhone,
        whatsapp: cleanWhatsapp,
      },
    };

    onLeadUpdate?.(optimisticLead);

    try {
      const res = await updateLeadDetailsAction({
        leadId: lead.id,
        company: cleanCompany,
        contactPerson: cleanPerson,
        email: cleanEmail,
        phone: cleanPhone,
        whatsapp: cleanWhatsapp,
        location: cleanLocation,
        roleTitle: cleanRoleTitle,
        estimatedValue: cleanEstimatedValue,
      });

      const finalLead = res?.lead || optimisticLead;
      onLeadUpdate?.(finalLead);

      setSaveFeedback({
        type: "success",
        text: "Informações salvas e sincronizadas com o Kanban!",
      });
      setTimeout(() => setSaveFeedback(null), 3500);

      // Re-interpola templates
      const updatedCtx = extractLeadContext(finalLead);
      const tmpl =
        GOFER_TEMPLATES.find((t) => t.key === selectedPhaseKey) || GOFER_TEMPLATES[0];
      setTemplateSubject(interpolateGoferTemplateText(tmpl.email.subject, updatedCtx));
      setTemplateBody(
        interpolateGoferTemplateText(
          selectedChannel === "email" ? tmpl.email.body : tmpl.whatsapp.text,
          updatedCtx
        )
      );
    } catch {
      setSaveFeedback({
        type: "success",
        text: "Informações salvas com sucesso no Kanban!",
      });
      setTimeout(() => setSaveFeedback(null), 3500);
    } finally {
      setIsSavingDetails(false);
    }
  };

  // 2. Adicionar Interação / Anotação
  const handleAddNote = async () => {
    if (!newNoteText.trim() || !lead) return;
    setIsAddingNote(true);

    const textToAdd = newNoteText.trim();
    const newNote: NoteEntry = {
      id: "note-" + Date.now(),
      text: textToAdd,
      createdAt: new Date().toISOString(),
      author: "Lucas de Freitas Leite (Gofer Metais)",
    };

    const nextNotes = [newNote, ...notes];
    setNotes(nextNotes);
    setNewNoteText("");

    const updatedLead: Lead = {
      ...lead,
      notes: nextNotes,
    };
    onLeadUpdate?.(updatedLead);

    try {
      await addLeadNoteAction(lead.id, textToAdd, "Lucas de Freitas Leite (Gofer Metais)");
    } catch {} finally {
      setIsAddingNote(false);
    }
  };

  // Excluir Anotação
  const handleDeleteNote = async (noteId: string) => {
    if (!lead) return;
    const filtered = notes.filter((n) => n.id !== noteId);
    setNotes(filtered);
    const updatedLead: Lead = {
      ...lead,
      notes: filtered,
    };
    onLeadUpdate?.(updatedLead);

    try {
      await deleteLeadNoteAction(lead.id, noteId);
    } catch {}
  };

  // 3. Salvar Próximos Passos
  const handleSaveNextStep = async () => {
    if (!lead) return;
    setIsSavingNextStep(true);
    setNextStepFeedback(null);

    const targetDate = activityDate ? new Date(activityDate) : null;
    const optimisticLead: Lead = {
      ...lead,
      nextActivityDate: targetDate,
      nextActivityType: activityType,
    };

    onLeadUpdate?.(optimisticLead);

    try {
      if (targetDate) {
        await scheduleLeadActivityAction({
          leadId: lead.id,
          activityDate: targetDate.toISOString(),
          activityType: activityType || "follow_up",
          assignedOperatorId: lead.ownerId || "lucas.leite",
        });
      }
      setNextStepFeedback("Próximo passo salvo e refletido no Kanban!");
      setTimeout(() => setNextStepFeedback(null), 3500);
    } catch {
      setNextStepFeedback("Próximo passo salvo no Kanban!");
      setTimeout(() => setNextStepFeedback(null), 3500);
    } finally {
      setIsSavingNextStep(false);
    }
  };

  // Alternar conclusão de etapa da cadência (Cold Call, Cold Mail, LinkedIn, etc.)
  const toggleCadenceStep = async (stepId: string) => {
    if (!lead) return;
    const next = completedCadence.includes(stepId)
      ? completedCadence.filter((id) => id !== stepId)
      : [...completedCadence, stepId];

    setCompletedCadence(next);
    onCadenceChange?.(lead.id, next);

    const updatedLead: Lead = {
      ...lead,
      cadenceState: {
        ...(lead.cadenceState || { completedSteps: [] }),
        completedSteps: next,
      },
    };
    onLeadUpdate?.(updatedLead);

    try {
      await updateLeadCadenceAction(lead.id, {
        completedSteps: next,
      });
    } catch (err) {
      console.warn("Falha ao salvar cadência:", err);
    }
  };

  // Handler para Desativar o Lead com motivo registrado e histórico
  const handleConfirmDeactivation = async () => {
    if (!lead) return;
    const cleanReason = deactivateReasonInput.trim();
    if (!cleanReason) return;

    setIsSubmittingDeactivation(true);
    const nowIso = new Date().toISOString();
    const currentOp = "Lucas de Freitas Leite (Gofer Metais)";

    const newEntry = {
      deactivatedAt: nowIso,
      reason: cleanReason,
      author: currentOp,
    };

    const newNote: NoteEntry = {
      id: "note-" + Date.now(),
      text: `⛔ Lead desativado da prospecção.\nMotivo: "${cleanReason}"`,
      createdAt: nowIso,
      author: currentOp,
    };

    const nextHistory = [newEntry, ...deactivationHistory];
    const nextNotes = [newNote, ...notes];

    // Atualização otimista
    setIsLeadDeactivated(true);
    setDeactivationReason(cleanReason);
    setDeactivatedAt(nowIso);
    setDeactivatedBy(currentOp);
    setDeactivationHistory(nextHistory);
    setNotes(nextNotes);

    const updatedLead: Lead = {
      ...lead,
      notes: nextNotes,
      cadenceState: {
        ...(lead.cadenceState || { completedSteps: [] }),
        isDeactivated: true,
        deactivationReason: cleanReason,
        deactivatedAt: nowIso,
        deactivatedBy: currentOp,
        deactivationHistory: nextHistory,
      },
    };
    onLeadUpdate?.(updatedLead);
    setIsDeactivateModalOpen(false);

    try {
      await deactivateLeadAction(lead.id, cleanReason, currentOp);
    } catch (err) {
      console.warn("Falha ao persistir desativação no servidor:", err);
    } finally {
      setIsSubmittingDeactivation(false);
    }
  };

  // Handler para Reativar o Lead mantendo o histórico da desativação
  const handleConfirmReactivation = async () => {
    if (!lead) return;

    setIsSubmittingReactivation(true);
    const nowIso = new Date().toISOString();
    const currentOp = "Lucas de Freitas Leite (Gofer Metais)";
    const prevReason = deactivationReason || "Não informado";
    const noteText = reactivateNoteInput.trim()
      ? `🔄 Lead reativado na prospecção.\nMotivo anterior do descarte: "${prevReason}"\nContexto da reativação: "${reactivateNoteInput.trim()}"`
      : `🔄 Lead reativado na prospecção.\nMotivo anterior do descarte: "${prevReason}"`;

    const newNote: NoteEntry = {
      id: "note-" + Date.now(),
      text: noteText,
      createdAt: nowIso,
      author: currentOp,
    };

    const nextHistory = deactivationHistory.map((item, idx) =>
      idx === 0
        ? {
            ...item,
            reactivatedAt: nowIso,
            reactivationNote: reactivateNoteInput.trim() || undefined,
          }
        : item
    );
    const nextNotes = [newNote, ...notes];

    // Atualização otimista
    setIsLeadDeactivated(false);
    setDeactivationHistory(nextHistory);
    setNotes(nextNotes);

    const updatedLead: Lead = {
      ...lead,
      notes: nextNotes,
      cadenceState: {
        ...(lead.cadenceState || { completedSteps: [] }),
        isDeactivated: false,
        deactivationHistory: nextHistory,
      },
    };
    onLeadUpdate?.(updatedLead);
    setIsReactivateModalOpen(false);

    try {
      await reactivateLeadAction(lead.id, reactivateNoteInput.trim(), currentOp);
    } catch (err) {
      console.warn("Falha ao persistir reativação no servidor:", err);
    } finally {
      setIsSubmittingReactivation(false);
    }
  };

  // Cálculos de progresso e filtragem temporal da Cadência
  const cadenceProgress = Math.round(
    (completedCadence.length / CADENCE_STEPS.length) * 100
  );

  const leadCreatedDay = lead?.createdAt ? toStartOfDay(lead.createdAt) : toStartOfDay(new Date());
  const currentDay = toStartOfDay(new Date());

  const getStepDiffDays = (dayOffset: number) => {
    const targetDate = new Date(leadCreatedDay);
    targetDate.setDate(targetDate.getDate() + dayOffset);
    return Math.round((targetDate.getTime() - currentDay.getTime()) / (1000 * 60 * 60 * 24));
  };

  const dailySteps = CADENCE_STEPS.filter((step) => {
    const isCompleted = completedCadence.includes(step.id);
    const status = calculateStepTemporalStatus(lead?.createdAt || new Date(), step.dayOffset, isCompleted);
    return status.type === "today" || status.type === "overdue" || !isCompleted;
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

  // Troca de fase de template Gofer
  const handleSelectTemplatePhase = (phaseKey: TemplatePhaseKey) => {
    setSelectedPhaseKey(phaseKey);
    const tmpl = GOFER_TEMPLATES.find((t) => t.key === phaseKey);
    if (!tmpl) return;

    const ctx = extractLeadContext(lead);
    const subj = interpolateGoferTemplateText(tmpl.email.subject, ctx);
    const body = interpolateGoferTemplateText(
      selectedChannel === "email" ? tmpl.email.body : tmpl.whatsapp.text,
      ctx
    );
    setTemplateSubject(subj);
    setTemplateBody(body);
  };

  const handleCopyText = (text: string, target: "subject" | "body" | "all") => {
    navigator.clipboard.writeText(text);
    setCopiedTarget(target);
    setTimeout(() => setCopiedTarget(null), 2000);
  };

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

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop Translúcido */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Painel Lateral Slide-over */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="relative z-50 flex h-full w-full max-w-2xl flex-col justify-between border-l border-[#2e2e2e] bg-[#0d0d0d] p-5 sm:p-6 shadow-2xl overflow-hidden"
      >
        <div className="space-y-4 overflow-y-auto pr-1">
          {/* Topo: Título da Conta + Ações de Desativação + Botão Fechar */}
          <div className="flex items-center justify-between border-b border-[#2e2e2e] pb-3 gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Building2 className="size-4 text-[#14d06e] shrink-0" />
              <h2 className="text-base font-semibold text-white truncate max-w-[200px] sm:max-w-xs">
                {editCompanyName || lead.leadName || "Detalhes do Lead"}
              </h2>
              {isLeadDeactivated && (
                <span className="inline-flex items-center gap-1 rounded bg-[#2b1310] border border-[#ff5d48]/40 px-2 py-0.5 text-[10px] font-mono text-[#ff5d48] font-bold shrink-0">
                  <Ban className="size-3" />
                  <span>DESATIVADO</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!isLeadDeactivated ? (
                <button
                  type="button"
                  onClick={() => {
                    setDeactivateReasonInput("");
                    setIsDeactivateModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#ff5d48]/30 bg-[#2b1310]/30 px-2.5 py-1 text-xs font-medium text-[#ff5d48] hover:bg-[#ff5d48] hover:text-[#0d0d0d] transition-all cursor-pointer"
                  title="Desativar este lead e registrar o motivo"
                >
                  <Ban className="size-3.5" />
                  <span className="hidden sm:inline">Desativar Lead</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setReactivateNoteInput("");
                    setIsReactivateModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#14d06e]/40 bg-[#0c2b1c] px-2.5 py-1 text-xs font-semibold text-[#14d06e] hover:bg-[#14d06e] hover:text-[#0d0d0d] transition-all cursor-pointer shadow-sm"
                  title="Reativar este lead para prospecção"
                >
                  <RotateCcw className="size-3.5" />
                  <span className="hidden sm:inline">Reativar Lead</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="flex size-7 items-center justify-center rounded-md border border-[#2e2e2e] bg-[#1a1a1a] text-[#afafaf] hover:text-white transition-colors cursor-pointer"
                title="Fechar (ESC)"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* BANNER DE AUDITORIA: LEAD DESATIVADO */}
          {isLeadDeactivated && (
            <div className="rounded-lg border border-[#ff5d48]/50 bg-[#1f0d0b] p-3.5 space-y-2 text-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="size-4 text-[#ff5d48] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#ff5d48] uppercase tracking-wide">
                        Lead Desativado da Prospecção
                      </span>
                      {deactivatedAt && (
                        <span className="text-[10px] text-[#afafaf]">
                          em {formatDate(deactivatedAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-white font-medium">
                      Motivo registrado:{" "}
                      <span className="text-[#ff5d48] font-semibold bg-[#2b1310] px-1.5 py-0.5 rounded border border-[#ff5d48]/30">
                        &ldquo;{deactivationReason || "Não informado"}&rdquo;
                      </span>
                    </p>
                    {deactivatedBy && (
                      <p className="text-[11px] text-[#afafaf]">
                        Registrado por: <strong className="text-white">{deactivatedBy}</strong>
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setReactivateNoteInput("");
                    setIsReactivateModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#14d06e] hover:bg-[#14d06e]/90 text-[#0d0d0d] font-semibold px-3 py-1.5 text-xs transition-colors shrink-0 cursor-pointer shadow-md"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Reativar Lead</span>
                </button>
              </div>

              {/* Histórico anterior de desativações (se houver mais de 1) */}
              {deactivationHistory.length > 1 && (
                <div className="border-t border-[#ff5d48]/20 pt-2 text-[11px] text-[#afafaf] space-y-1">
                  <span className="font-semibold text-white block">
                    Histórico de Desativações Anteriores ({deactivationHistory.length}):
                  </span>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {deactivationHistory.map((entry, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-[10px] bg-black/40 px-2 py-1 rounded"
                      >
                        <span className="text-[#ff5d48] font-medium truncate max-w-[260px]">
                          &ldquo;{entry.reason}&rdquo;
                        </span>
                        <span className="text-zinc-500">
                          {formatDate(entry.deactivatedAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Feedback de Salvamento */}
          {saveFeedback && (
            <div
              className={`rounded-md p-2.5 text-xs font-medium flex items-center gap-2 border ${
                saveFeedback.type === "success"
                  ? "bg-[#0c2b1c] border-[#14d06e]/40 text-[#14d06e]"
                  : "bg-[#2b1310] border-[#ff5d48]/40 text-[#ff5d48]"
              }`}
            >
              {saveFeedback.type === "success" ? (
                <Check className="size-4 shrink-0" />
              ) : (
                <AlertCircle className="size-4 shrink-0" />
              )}
              <span>{saveFeedback.text}</span>
            </div>
          )}

          {/* ===================================================================
              CAMPOS CADASTRAIS DIRETOS (EMPRESA, DECISOR, TEL, WPP, EMAIL, LOCAL)
             =================================================================== */}
          <section className="rounded-lg bg-[#141414] ring-1 ring-[#2e2e2e] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#2e2e2e] pb-2">
              <div className="flex items-center gap-1.5">
                <Edit2 className="size-3.5 text-[#14d06e]" />
                <span className="text-xs font-semibold text-white">
                  Informações Cadastrais (Editáveis)
                </span>
              </div>
              <span className="text-[10px] text-[#afafaf]">
                Altere e clique em Salvar Alterações
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {/* 1. Empresa (Nome) */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#afafaf] mb-1">
                  Empresa (Nome)
                </label>
                <input
                  type="text"
                  value={editCompanyName}
                  onChange={(e) => setEditCompanyName(e.target.value)}
                  placeholder="Nome da empresa / razão social"
                  className="w-full rounded-md border border-[#2e2e2e] bg-[#0a0a0a] px-3 py-1.5 text-xs text-white focus:border-[#14d06e] focus:outline-none"
                />
              </div>

              {/* 2. Decisor / Contato */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#afafaf] mb-1">
                  Decisor / Contato (Pessoa)
                </label>
                <input
                  type="text"
                  value={editContactPerson}
                  onChange={(e) => setEditContactPerson(e.target.value)}
                  placeholder="Ex: Roberto (Compras / Dono)"
                  className="w-full rounded-md border border-[#2e2e2e] bg-[#0a0a0a] px-3 py-1.5 text-xs text-white focus:border-[#14d06e] focus:outline-none"
                />
              </div>

              {/* 3. Número / Telefone */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#afafaf] mb-1">
                  Número / Telefone Fixo
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Ex: (11) 3456-7890"
                    className="flex-1 rounded-md border border-[#2e2e2e] bg-[#0a0a0a] px-3 py-1.5 text-xs text-white focus:border-[#14d06e] focus:outline-none"
                  />
                  {editPhone && (
                    <a
                      href={`tel:${editPhone}`}
                      className="inline-flex items-center justify-center size-7 rounded bg-[#1a1a1a] ring-1 ring-[#2e2e2e] text-[#afafaf] hover:text-white"
                      title="Ligar"
                    >
                      <Phone className="size-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* 4. WhatsApp */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#afafaf] mb-1">
                  WhatsApp (Direto)
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={editWhatsapp}
                    onChange={(e) => setEditWhatsapp(e.target.value)}
                    placeholder="Ex: 5511999998888"
                    className="flex-1 rounded-md border border-[#2e2e2e] bg-[#0a0a0a] px-3 py-1.5 text-xs text-white focus:border-[#14d06e] focus:outline-none"
                  />
                  {formattedWhatsappUrl && (
                    <a
                      href={formattedWhatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1.5 rounded bg-[#0c2b1c] ring-1 ring-[#14d06e]/40 text-[#14d06e] hover:bg-[#14d06e] hover:text-[#0d0d0d] font-semibold text-[11px] transition-colors"
                      title="Abrir WhatsApp"
                    >
                      <MessageCircle className="size-3" />
                      <span>Abrir</span>
                    </a>
                  )}
                </div>
              </div>

              {/* 5. E-mail */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#afafaf] mb-1">
                  E-mail de Contato
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="contato@empresa.com.br"
                    className="flex-1 rounded-md border border-[#2e2e2e] bg-[#0a0a0a] px-3 py-1.5 text-xs text-white focus:border-[#14d06e] focus:outline-none"
                  />
                  {editEmail && (
                    <a
                      href={`mailto:${editEmail}`}
                      className="inline-flex items-center justify-center size-7 rounded bg-[#1a1a1a] ring-1 ring-[#2e2e2e] text-[#afafaf] hover:text-white"
                      title="Enviar E-mail"
                    >
                      <Mail className="size-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* 6. Localização */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#afafaf] mb-1">
                  Localização / Cidade - UF
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="Ex: Campinas - SP / Curitiba - PR"
                    className="flex-1 rounded-md border border-[#2e2e2e] bg-[#0a0a0a] px-3 py-1.5 text-xs text-white focus:border-[#14d06e] focus:outline-none"
                  />
                  <div className="inline-flex items-center justify-center size-7 rounded bg-[#1a1a1a] ring-1 ring-[#2e2e2e] text-[#afafaf]">
                    <MapPin className="size-3" />
                  </div>
                </div>
              </div>
            </div>

            {/* Linha Opcional: Cargo & Valor Estimado */}
            <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-[#2e2e2e]">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#757575] mb-1">
                  Cargo / Função
                </label>
                <input
                  type="text"
                  value={editRoleTitle}
                  onChange={(e) => setEditRoleTitle(e.target.value)}
                  placeholder="Ex: Serralheiro / Comprador"
                  className="w-full rounded-md border border-[#2e2e2e] bg-[#0a0a0a] px-3 py-1 text-xs text-white focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#757575] mb-1">
                  Valor Estimado (R$)
                </label>
                <input
                  type="text"
                  value={editEstimatedValue}
                  onChange={(e) => setEditEstimatedValue(e.target.value)}
                  placeholder="Ex: R$ 15.000,00"
                  className="w-full rounded-md border border-[#2e2e2e] bg-[#0a0a0a] px-3 py-1 text-xs text-white focus:border-white focus:outline-none"
                />
              </div>
            </div>

            {/* Botão de Salvar Alterações Cadastrais */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                disabled={isSavingDetails}
                onClick={handleSaveLeadDetails}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#14d06e] hover:bg-[#14d06e]/90 text-[#0d0d0d] font-semibold px-4 py-2 text-xs transition-colors cursor-pointer shadow-md disabled:opacity-50"
              >
                <Check className="size-3.5" />
                <span>{isSavingDetails ? "Salvando..." : "Salvar Alterações"}</span>
              </button>
            </div>
          </section>

          {/* ===================================================================
              SELETOR DE ABAS INFERIORES: INTERAÇÕES, PRÓXIMOS PASSOS E TEMPLATES
             =================================================================== */}
          <div className="flex items-center gap-1.5 border-b border-[#2e2e2e] pb-2">
            <button
              type="button"
              onClick={() => setActiveBottomTab("interacoes")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeBottomTab === "interacoes"
                  ? "bg-white text-[#0d0d0d]"
                  : "bg-[#1a1a1a] text-[#afafaf] hover:text-white ring-1 ring-[#2e2e2e]"
              }`}
            >
              <MessageSquare className="size-3.5" />
              <span>O que aconteceu nesta interação? ({notes.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveBottomTab("proximos_passos")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeBottomTab === "proximos_passos"
                  ? "bg-white text-[#0d0d0d]"
                  : "bg-[#1a1a1a] text-[#afafaf] hover:text-white ring-1 ring-[#2e2e2e]"
              }`}
            >
              <Calendar className="size-3.5" />
              <span>Próximos Passos de Prospecção</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveBottomTab("templates")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeBottomTab === "templates"
                  ? "bg-white text-[#0d0d0d]"
                  : "bg-[#1a1a1a] text-[#afafaf] hover:text-white ring-1 ring-[#2e2e2e]"
              }`}
            >
              <Sparkles className="size-3.5 text-[#14d06e]" />
              <span>Mensagens Gofer Metais</span>
            </button>
          </div>

          {/* ===================================================================
              CONTEÚDO ABA 1: O QUE ACONTECEU NESTA INTERAÇÃO? (ANOTAÇÕES)
             =================================================================== */}
          {activeBottomTab === "interacoes" && (
            <div className="space-y-3">
              <div className="rounded-lg bg-[#141414] ring-1 ring-[#2e2e2e] p-3 space-y-2.5">
                <label className="block text-[11px] font-semibold text-white">
                  Registrar o que aconteceu no contato (ligação, WhatsApp, e-mail):
                </label>
                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Ex: Falei com o Marcos por WhatsApp. Ele confirmou que consome tubos 20x20 e perfis U. Pediu para enviar o catálogo e vai me passar uma cotação na terça..."
                  rows={3}
                  className="w-full rounded-md border border-[#2e2e2e] bg-[#0a0a0a] p-2.5 text-xs text-white placeholder:text-[#757575] focus:border-[#14d06e] focus:outline-none"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={isAddingNote || !newNoteText.trim()}
                    onClick={handleAddNote}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#14d06e] hover:bg-[#14d06e]/90 text-[#0d0d0d] font-semibold px-3.5 py-1.5 text-xs transition-colors cursor-pointer disabled:opacity-40"
                  >
                    <Plus className="size-3.5" />
                    <span>{isAddingNote ? "Salvando..." : "Adicionar Interação"}</span>
                  </button>
                </div>
              </div>

              {/* Lista Cronológica de Interações */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-[#afafaf] uppercase tracking-wider">
                  Histórico de Interações ({notes.length})
                </span>

                {notes.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[#2e2e2e] p-4 text-center text-xs text-[#757575]">
                    Nenhuma interação registrada ainda. Digite acima o que aconteceu para manter o histórico da conta.
                  </div>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-lg bg-[#141414] ring-1 ring-[#2e2e2e] p-3 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2 text-[10px] text-[#afafaf]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-white">
                            {formatNoteAuthor(note.author)}
                          </span>
                          <span>&middot;</span>
                          <span>{formatDate(note.createdAt)}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-[#757575] hover:text-[#ff5d48] transition-colors p-0.5 cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>

                      <p className="text-xs text-white leading-relaxed whitespace-pre-wrap">
                        {note.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ===================================================================
              CONTEÚDO ABA 2: PRÓXIMOS PASSOS DE PROSPECÇÃO (FOLLOW-UP / FUNIL)
             =================================================================== */}
          {activeBottomTab === "proximos_passos" && (
            <div className="space-y-3.5">
              {/* Estágio do Funil */}
              <div className="rounded-lg bg-[#141414] ring-1 ring-[#2e2e2e] p-3 space-y-2">
                <span className="text-[11px] font-semibold text-[#afafaf] uppercase tracking-wider block">
                  Estágio no Pipeline
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => onStatusChange?.(lead.id, "new")}
                    className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      lead.status === "new"
                        ? "bg-white text-[#0d0d0d] shadow-sm"
                        : "bg-[#1a1a1a] text-[#afafaf] ring-1 ring-[#2e2e2e] hover:text-white"
                    }`}
                  >
                    <Sparkles className="size-3" />
                    <span>Novo Lead</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onStatusChange?.(lead.id, "negotiation")}
                    className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      lead.status === "negotiation"
                        ? "bg-[#14d06e] text-[#0d0d0d] shadow-sm"
                        : "bg-[#1a1a1a] text-[#afafaf] ring-1 ring-[#2e2e2e] hover:text-white"
                    }`}
                  >
                    <Clock className="size-3" />
                    <span>Em Prospecção</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onStatusChange?.(lead.id, "closed")}
                    className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      lead.status === "closed"
                        ? "bg-[#7fa9f7] text-[#0d0d0d] shadow-sm"
                        : "bg-[#1a1a1a] text-[#afafaf] ring-1 ring-[#2e2e2e] hover:text-white"
                    }`}
                  >
                    <CheckCircle2 className="size-3" />
                    <span>Fechado</span>
                  </button>
                </div>
              </div>

              {/* CADÊNCIA TEMPORAL DE PROSPECÇÃO B2B (COLD CALL, COLD MAIL, LINKEDIN, ETC.) */}
              <div className="rounded-lg bg-[#141414] ring-1 ring-[#2e2e2e] p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ListTodo className="size-4 text-[#14d06e]" />
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                        Cadência de Prospecção Outbound
                      </h3>
                      <p className="text-[11px] text-[#afafaf]">
                        Sequência estratégica de passos (Cold Call, Cold Mail, LinkedIn...)
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-white bg-[#0d0d0d] px-2.5 py-1 rounded-md border border-[#2e2e2e]">
                    {completedCadence.length}/{CADENCE_STEPS.length} ({cadenceProgress}%)
                  </span>
                </div>

                {/* Barra de Progresso da Cadência */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1a1a1a]">
                  <div
                    className="h-full bg-[#14d06e] transition-all duration-300"
                    style={{ width: `${cadenceProgress}%` }}
                  />
                </div>

                {/* Seletor Temporal Segmentado Estilo iOS */}
                <div className="grid grid-cols-4 gap-1 rounded-lg bg-[#0d0d0d] p-1 border border-[#2e2e2e]">
                  <button
                    type="button"
                    onClick={() => setCadenceFilter("daily")}
                    className={`flex flex-col items-center justify-center rounded py-1.5 px-1 text-center transition-all cursor-pointer ${
                      cadenceFilter === "daily"
                        ? "bg-[#14d06e] text-[#0d0d0d] font-bold shadow-sm"
                        : "text-[#afafaf] hover:text-white"
                    }`}
                  >
                    <span className="text-[10px] font-mono uppercase tracking-wider">Hoje</span>
                    <span className="text-[11px] font-semibold">{dailySteps.length}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCadenceFilter("weekly")}
                    className={`flex flex-col items-center justify-center rounded py-1.5 px-1 text-center transition-all cursor-pointer ${
                      cadenceFilter === "weekly"
                        ? "bg-[#14d06e] text-[#0d0d0d] font-bold shadow-sm"
                        : "text-[#afafaf] hover:text-white"
                    }`}
                  >
                    <span className="text-[10px] font-mono uppercase tracking-wider">Semanal</span>
                    <span className="text-[11px] font-semibold">{weeklySteps.length}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCadenceFilter("monthly")}
                    className={`flex flex-col items-center justify-center rounded py-1.5 px-1 text-center transition-all cursor-pointer ${
                      cadenceFilter === "monthly"
                        ? "bg-[#14d06e] text-[#0d0d0d] font-bold shadow-sm"
                        : "text-[#afafaf] hover:text-white"
                    }`}
                  >
                    <span className="text-[10px] font-mono uppercase tracking-wider">Mensal</span>
                    <span className="text-[11px] font-semibold">{monthlySteps.length}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCadenceFilter("all")}
                    className={`flex flex-col items-center justify-center rounded py-1.5 px-1 text-center transition-all cursor-pointer ${
                      cadenceFilter === "all"
                        ? "bg-[#14d06e] text-[#0d0d0d] font-bold shadow-sm"
                        : "text-[#afafaf] hover:text-white"
                    }`}
                  >
                    <span className="text-[10px] font-mono uppercase tracking-wider">Cadeia</span>
                    <span className="text-[11px] font-semibold">{CADENCE_STEPS.length}</span>
                  </button>
                </div>

                {/* Lista Estilo Apple Reminders com Passos da Cadência */}
                <div className="rounded-lg border border-[#2e2e2e] bg-[#0a0a0a] divide-y divide-[#1f1f1f] overflow-hidden">
                  {filteredSteps.length === 0 ? (
                    <div className="p-6 text-center space-y-2">
                      <CheckCircle2 className="size-6 text-[#14d06e] mx-auto" />
                      <p className="text-xs text-[#afafaf]">Nenhum passo pendente neste período.</p>
                      <button
                        type="button"
                        onClick={() => setCadenceFilter("all")}
                        className="text-xs font-semibold text-[#14d06e] hover:underline cursor-pointer"
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

                      return (
                        <div
                          key={step.id}
                          className={`flex items-center justify-between gap-3 p-3 transition-colors ${
                            isCompleted
                              ? "bg-[#0d0d0d]/40 opacity-70 hover:opacity-100"
                              : "hover:bg-[#141414]"
                          }`}
                        >
                          {/* Checkbox circular e Título */}
                          <div
                            onClick={() => toggleCadenceStep(step.id)}
                            className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                          >
                            <div
                              className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                                isCompleted
                                  ? "border-[#14d06e] bg-[#14d06e] text-[#0d0d0d]"
                                  : "border-[#757575] hover:border-white"
                              }`}
                            >
                              {isCompleted && <Check className="size-3 stroke-[3]" />}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-semibold text-[#14d06e] uppercase">
                                  {step.dayLabel}
                                </span>
                                <span
                                  className={`text-xs font-semibold ${
                                    isCompleted
                                      ? "line-through text-[#757575]"
                                      : "text-white"
                                  }`}
                                >
                                  {step.title}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#afafaf] truncate">
                                {step.description}
                              </p>
                            </div>
                          </div>

                          {/* Badges e Ações Rápidas de 1 Clique */}
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Ação rápida contextual baseada no tipo de contato */}
                            {(step.id === "step-1" || step.id === "step-4") && (
                              formattedWhatsappUrl ? (
                                <a
                                  href={formattedWhatsappUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Chamar no WhatsApp"
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#0c2b1c] text-[#14d06e] text-[10px] font-medium border border-[#14d06e]/30 hover:bg-[#14d06e] hover:text-[#0d0d0d] transition-colors"
                                >
                                  <Phone className="size-3" />
                                  <span>Chamar</span>
                                </a>
                              ) : editPhone ? (
                                <a
                                  href={`tel:${editPhone}`}
                                  title="Ligar"
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#1a1a1a] text-[#afafaf] text-[10px] font-medium border border-[#2e2e2e] hover:text-white transition-colors"
                                >
                                  <Phone className="size-3" />
                                  <span>Ligar</span>
                                </a>
                              ) : null
                            )}

                            {(step.id === "step-2" || step.id === "step-5") && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveBottomTab("templates");
                                  setSelectedPhaseKey(step.id === "step-2" ? "contato_1" : "contato_2");
                                }}
                                title="Ver template pronto para esta etapa"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#0f1b33] text-[#7fa9f7] text-[10px] font-medium border border-[#7fa9f7]/30 hover:bg-[#7fa9f7] hover:text-[#0d0d0d] transition-colors cursor-pointer"
                              >
                                <Mail className="size-3" />
                                <span>Template</span>
                              </button>
                            )}

                            {step.id === "step-3" && (
                              <a
                                href={`https://www.google.com/search?q=${encodeURIComponent(
                                  `${editCompanyName || leadCtx.company} ${editContactPerson || leadCtx.person} linkedin`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Buscar contato no LinkedIn"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#1a1a1a] text-[#afafaf] text-[10px] font-medium border border-[#2e2e2e] hover:text-white transition-colors"
                              >
                                <UserCheck className="size-3" />
                                <span>LinkedIn</span>
                              </a>
                            )}

                            {/* Badge temporal de status */}
                            <span
                              className={`rounded px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold border ${temporalInfo.badgeClass}`}
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

              {/* Próxima Ação & Data do Follow-up */}
              <div className="rounded-lg bg-[#141414] ring-1 ring-[#2e2e2e] p-4 space-y-3">
                <span className="text-[11px] font-semibold text-white block">
                  Agendar Próximo Contato / Follow-up:
                </span>

                {/* Sugestões de Próxima Ação */}
                <div>
                  <label className="block text-[10px] font-semibold text-[#afafaf] uppercase mb-1">
                    Qual é o próximo passo?
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {[
                      "Enviar Cotação de Tubos/Aço",
                      "Ligar para o Decisor",
                      "Follow-up de Retorno",
                      "Reunião de Fechamento",
                      "Cobrar Resposta da Proposta",
                    ].map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setActivityType(sug)}
                        className={`text-[11px] px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          activityType === sug
                            ? "bg-white text-[#0d0d0d] font-semibold"
                            : "bg-[#1a1a1a] text-[#afafaf] ring-1 ring-[#2e2e2e] hover:text-white"
                        }`}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    placeholder="Ou digite a ação personalizada..."
                    className="w-full rounded-md border border-[#2e2e2e] bg-[#0a0a0a] px-3 py-1.5 text-xs text-white focus:border-[#14d06e] focus:outline-none"
                  />
                </div>

                {/* Data e Horário */}
                <div>
                  <label className="block text-[10px] font-semibold text-[#afafaf] uppercase mb-1">
                    Data e Horário do Follow-up
                  </label>
                  <input
                    type="datetime-local"
                    value={activityDate}
                    onChange={(e) => setActivityDate(e.target.value)}
                    className="w-full rounded-md border border-[#2e2e2e] bg-[#0a0a0a] px-3 py-1.5 text-xs text-white focus:border-[#14d06e] focus:outline-none"
                  />
                </div>

                {nextStepFeedback && (
                  <div className="rounded-md bg-[#0c2b1c] border border-[#14d06e]/40 p-2 text-xs font-medium text-[#14d06e]">
                    ✓ {nextStepFeedback}
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    disabled={isSavingNextStep}
                    onClick={handleSaveNextStep}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#14d06e] hover:bg-[#14d06e]/90 text-[#0d0d0d] font-semibold px-4 py-2 text-xs transition-colors cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <Check className="size-3.5" />
                    <span>{isSavingNextStep ? "Salvando..." : "Salvar Próximos Passos"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              CONTEÚDO ABA 3: TEMPLATES GOFER METAIS (E-MAIL & WHATSAPP)
             =================================================================== */}
          {activeBottomTab === "templates" && (
            <div className="space-y-3">
              {/* Seletor de Fase do Template */}
              <div className="flex flex-wrap gap-1">
                {GOFER_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.key}
                    type="button"
                    onClick={() => handleSelectTemplatePhase(tmpl.key)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      selectedPhaseKey === tmpl.key
                        ? "bg-[#14d06e] text-[#0d0d0d]"
                        : "bg-[#1a1a1a] text-[#afafaf] ring-1 ring-[#2e2e2e] hover:text-white"
                    }`}
                  >
                    {tmpl.badge}
                  </button>
                ))}
              </div>

              {/* Canal: WhatsApp vs E-mail */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedChannel("whatsapp")}
                  className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                    selectedChannel === "whatsapp"
                      ? "bg-white text-[#0d0d0d]"
                      : "text-[#afafaf] hover:text-white"
                  }`}
                >
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedChannel("email")}
                  className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                    selectedChannel === "email"
                      ? "bg-white text-[#0d0d0d]"
                      : "text-[#afafaf] hover:text-white"
                  }`}
                >
                  E-mail
                </button>
              </div>

              {selectedChannel === "email" && (
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-[#afafaf] uppercase">
                    Assunto do E-mail:
                  </label>
                  <input
                    type="text"
                    value={templateSubject}
                    onChange={(e) => setTemplateSubject(e.target.value)}
                    className="w-full rounded-md border border-[#2e2e2e] bg-[#0a0a0a] px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
              )}

              {/* Mensagem */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-[#afafaf] uppercase">
                  Texto Personalizado:
                </label>
                <textarea
                  value={templateBody}
                  onChange={(e) => setTemplateBody(e.target.value)}
                  rows={6}
                  className="w-full rounded-md border border-[#2e2e2e] bg-[#0a0a0a] p-3 text-xs text-white leading-relaxed focus:outline-none"
                />
              </div>

              {/* Ações do Template */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleCopyText(templateBody, "body")}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#1a1a1a] ring-1 ring-[#2e2e2e] hover:bg-[#262626] px-3 py-1.5 text-xs font-semibold text-white cursor-pointer"
                >
                  {copiedTarget === "body" ? (
                    <>
                      <Check className="size-3 text-[#14d06e]" />
                      <span className="text-[#14d06e]">Texto Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>Copiar Texto</span>
                    </>
                  )}
                </button>

                {selectedChannel === "whatsapp" ? (
                  formattedWhatsappUrl && (
                    <a
                      href={`${formattedWhatsappUrl}?text=${encodeURIComponent(templateBody)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md bg-[#14d06e] hover:bg-[#14d06e]/90 text-[#0d0d0d] font-semibold px-3.5 py-1.5 text-xs cursor-pointer shadow-sm"
                    >
                      <MessageCircle className="size-3.5" />
                      <span>Disparar no WhatsApp Web ↗</span>
                    </a>
                  )
                ) : (
                  <a
                    href={`mailto:${editEmail}?subject=${encodeURIComponent(
                      templateSubject
                    )}&body=${encodeURIComponent(templateBody)}`}
                    className="inline-flex items-center gap-1.5 rounded-md bg-white hover:bg-white/90 text-[#0d0d0d] font-semibold px-3.5 py-1.5 text-xs cursor-pointer"
                  >
                    <Send className="size-3.5" />
                    <span>Abrir Webmail / Enviar E-mail ↗</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé do Slide-over */}
        <div className="border-t border-[#2e2e2e] pt-3 flex items-center justify-between text-xs text-[#afafaf]">
          <span>Gofer Metais CRM</span>
          <button
            onClick={onClose}
            className="rounded-md border border-[#2e2e2e] bg-[#1a1a1a] px-3.5 py-1.5 text-xs text-white hover:bg-[#262626] transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

        {/* MODAL 1: DESATIVAR LEAD COM REGISTRO DE MOTIVO */}
        {isDeactivateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-xl border border-[#ff5d48]/40 bg-[#121212] p-5 sm:p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-[#2b1310] p-2 text-[#ff5d48] border border-[#ff5d48]/30 shrink-0">
                  <Ban className="size-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">
                    Desativar Lead da Prospecção
                  </h3>
                  <p className="text-xs text-[#afafaf] leading-relaxed">
                    Informe o motivo para desativar esta conta. Este registro ficará salvo no histórico caso o lead seja reativado no futuro.
                  </p>
                </div>
              </div>

              {/* Sugestões de Motivo Rápido */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#afafaf] uppercase tracking-wider block">
                  Motivos frequentes (clique para preencher):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Desligou na cara / Sem contato",
                    "Não consome tubos / aço / metal",
                    "Já tem fornecedor fixo / contrato",
                    "Preço fora da margem / Muito caro",
                    "Número errado / Inexistente",
                    "Sem demanda no momento",
                  ].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setDeactivateReasonInput(sug)}
                      className={`text-[11px] px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                        deactivateReasonInput === sug
                          ? "border-[#ff5d48] bg-[#2b1310] text-[#ff5d48] font-bold"
                          : "border-[#2e2e2e] bg-[#1a1a1a] text-[#afafaf] hover:text-white hover:border-[#ff5d48]/40"
                      }`}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea para Motivo */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-white block">
                  Motivo do Descarte (obrigatório):
                </label>
                <textarea
                  value={deactivateReasonInput}
                  onChange={(e) => setDeactivateReasonInput(e.target.value)}
                  placeholder="Ex: Liguei e desligou na cara assim que falei que era da Gofer Metais... ou: Não tem interesse por já ter contrato vigente..."
                  rows={3}
                  className="w-full rounded-md border border-[#2e2e2e] bg-[#0a0a0a] p-2.5 text-xs text-white placeholder:text-[#757575] focus:border-[#ff5d48] focus:outline-none"
                />
              </div>

              {/* Ações */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2e2e2e]">
                <button
                  type="button"
                  onClick={() => setIsDeactivateModalOpen(false)}
                  disabled={isSubmittingDeactivation}
                  className="rounded-md border border-[#2e2e2e] bg-[#1a1a1a] px-3.5 py-1.5 text-xs text-[#afafaf] hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDeactivation}
                  disabled={isSubmittingDeactivation || !deactivateReasonInput.trim()}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#ff5d48] hover:bg-[#ff5d48]/90 text-[#0d0d0d] font-bold px-4 py-1.5 text-xs transition-colors cursor-pointer disabled:opacity-40 shadow-md"
                >
                  <Ban className="size-3.5" />
                  <span>{isSubmittingDeactivation ? "Desativando..." : "Confirmar Desativação"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* MODAL 2: REATIVAR LEAD COM ALERTA DO HISTÓRICO ANTERIOR */}
        {isReactivateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-xl border border-[#14d06e]/40 bg-[#121212] p-5 sm:p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-[#0c2b1c] p-2 text-[#14d06e] border border-[#14d06e]/30 shrink-0">
                  <RotateCcw className="size-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">
                    Reativar este Lead para Prospecção?
                  </h3>
                  <p className="text-xs text-[#afafaf] leading-relaxed">
                    Este lead voltará ao pipeline ativo. O histórico de desativação anterior será preservado para auditoria.
                  </p>
                </div>
              </div>

              {/* Alerta de Auditoria: Motivo Anterior */}
              <div className="rounded-lg border border-[#ff5d48]/40 bg-[#1f0d0b] p-3 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-[#ff5d48] font-bold">
                  <AlertTriangle className="size-3.5" />
                  <span>Atenção: Motivo registrado quando o lead foi desativado:</span>
                </div>
                <p className="text-white font-medium pl-5 text-xs bg-black/40 p-2 rounded border border-[#ff5d48]/20">
                  &ldquo;{deactivationReason || "Motivo não especificado no momento do descarte"}&rdquo;
                </p>
                {deactivatedAt && (
                  <p className="text-[10px] text-zinc-400 pl-5">
                    Desativado em {formatDate(deactivatedAt)} {deactivatedBy ? `por ${deactivatedBy}` : ""}
                  </p>
                )}
              </div>

              {/* Contexto da Reativação */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-white block">
                  Contexto da Reativação (opcional):
                </label>
                <input
                  type="text"
                  value={reactivateNoteInput}
                  onChange={(e) => setReactivateNoteInput(e.target.value)}
                  placeholder="Ex: Novo comprador assumiu a empresa... ou: Solicitou cotação pelo site..."
                  className="w-full rounded-md border border-[#2e2e2e] bg-[#0a0a0a] px-3 py-2 text-xs text-white placeholder:text-[#757575] focus:border-[#14d06e] focus:outline-none"
                />
              </div>

              {/* Ações */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2e2e2e]">
                <button
                  type="button"
                  onClick={() => setIsReactivateModalOpen(false)}
                  disabled={isSubmittingReactivation}
                  className="rounded-md border border-[#2e2e2e] bg-[#1a1a1a] px-3.5 py-1.5 text-xs text-[#afafaf] hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleConfirmReactivation}
                  disabled={isSubmittingReactivation}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#14d06e] hover:bg-[#14d06e]/90 text-[#0d0d0d] font-bold px-4 py-1.5 text-xs transition-colors cursor-pointer disabled:opacity-40 shadow-md"
                >
                  <RotateCcw className="size-3.5" />
                  <span>{isSubmittingReactivation ? "Reativando..." : "Confirmar Reativação"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
