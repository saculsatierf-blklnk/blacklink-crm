"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Building2,
  Calendar,
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
  UserCheck,
  X,
  Zap,
} from "lucide-react";
import type { Lead } from "@/db/schema";
import type { LeadStatus } from "@/actions/leads";
import {
  CADENCE_STEPS,
  calculateStepTemporalStatus,
  buildDefaultInterpolatedScript,
  parseLeadInfo,
  toStartOfDay,
} from "@/lib/cadence";

interface LeadDetailsSheetProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (leadId: string, newStatus: LeadStatus) => void;
  onCadenceChange?: (leadId: string, completedStepIds: string[]) => void;
}

interface NoteEntry {
  id: string;
  text: string;
  createdAt: string;
  author: string;
}

export function LeadDetailsSheet({
  lead,
  isOpen,
  onClose,
  onStatusChange,
  onCadenceChange,
}: LeadDetailsSheetProps) {
  const parsed = lead ? parseLeadInfo(lead.leadName) : { name: "", company: "" };

  // Metadados específicos do Hunter (Cargo e Valor Estimado)
  const [roleTitle, setRoleTitle] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [isEditingMeta, setIsEditingMeta] = useState(false);

  // Checklist de Cadência
  const [completedCadence, setCompletedCadence] = useState<string[]>([]);

  // Script Dinâmico de Abordagem (Sempre Imediatamente Interpolado)
  const [scriptText, setScriptText] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  // Histórico de Anotações
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [newNoteText, setNewNoteText] = useState("");

  // Sincronização ao abrir ou alternar de lead
  useEffect(() => {
    if (!lead) return;

    // 1. Resolução de Metadados do Hunter
    const metaStorageKey = `blacklink_hunter_meta_${lead.id}`;
    const savedMeta = localStorage.getItem(metaStorageKey);
    let resolvedRole = "";
    let resolvedValue = "";

    if (savedMeta) {
      try {
        const parsedMeta = JSON.parse(savedMeta);
        resolvedRole = parsedMeta.roleTitle || "";
        resolvedValue = parsedMeta.estimatedValue || "";
      } catch {
        // Ignora
      }
    }

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

    // 2. Checklist de Cadência
    const cadenceKey = `blacklink_hunter_cadence_${lead.id}`;
    const savedCadence = localStorage.getItem(cadenceKey);
    let currentCompleted: string[] = [];

    if (savedCadence) {
      try {
        currentCompleted = JSON.parse(savedCadence);
      } catch {
        currentCompleted = [];
      }
    } else {
      if (lead.status === "negotiation" || lead.status === "closed") {
        currentCompleted = ["step-1"];
      } else {
        currentCompleted = [];
      }
    }
    setCompletedCadence(currentCompleted);

    // 3. Script Dinâmico: INTERPOLAÇÃO IMEDIATA
    // O operador abre o modal e o script já está renderizado com os dados reais do lead
    const scriptKey = `blacklink_hunter_script_${lead.id}`;
    const savedScript = localStorage.getItem(scriptKey);

    if (savedScript && savedScript.trim()) {
      // Caso haja placeholders brutos no script salvo, resolve-os na hora
      const resolved = savedScript
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
    const notesKey = `blacklink_hunter_notes_${lead.id}`;
    const savedNotes = localStorage.getItem(notesKey);
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch {
        setNotes([]);
      }
    } else {
      setNotes([
        {
          id: "note-init",
          text: `Lead qualificado e inserido no funil via canal "${lead.origin || "Direto"}".`,
          createdAt: new Date().toISOString(),
          author: "Lucas Leite (Hunter)",
        },
      ]);
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

  // Persistência de Metadados e regeneração do script se necessário
  const handleSaveMeta = () => {
    const metaStorageKey = `blacklink_hunter_meta_${lead.id}`;
    localStorage.setItem(
      metaStorageKey,
      JSON.stringify({ roleTitle, estimatedValue })
    );
    setIsEditingMeta(false);
  };

  // Toggle de etapas de cadência sensíveis ao tempo
  const toggleCadenceStep = (stepId: string) => {
    setCompletedCadence((prev) => {
      const next = prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId];

      localStorage.setItem(
        `blacklink_hunter_cadence_${lead.id}`,
        JSON.stringify(next)
      );

      // Notifica o componente pai para atualizar o badge do card no Kanban
      onCadenceChange?.(lead.id, next);
      return next;
    });
  };

  // Edição e persistência do script imediatamente no storage
  const handleScriptChange = (newText: string) => {
    setScriptText(newText);
    localStorage.setItem(`blacklink_hunter_script_${lead.id}`, newText);
  };

  // Inserção rápida de variável já com o valor real do lead
  const handleInsertResolvedVariable = (val: string) => {
    const updated = scriptText + " " + val;
    handleScriptChange(updated);
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

  // Restaurar script padrão imediatamente interpolado
  const handleResetScript = () => {
    const resetText = buildDefaultInterpolatedScript({
      name: parsed.name,
      company: parsed.company,
      role: roleTitle,
      value: estimatedValue,
    });
    handleScriptChange(resetText);
  };

  // Adicionar nova anotação ao histórico
  const handleAddNote = () => {
    if (!newNoteText.trim()) return;

    const newEntry: NoteEntry = {
      id: "note-" + Date.now(),
      text: newNoteText.trim(),
      createdAt: new Date().toISOString(),
      author: "Lucas Leite (Hunter)",
    };

    const updated = [newEntry, ...notes];
    setNotes(updated);
    localStorage.setItem(
      `blacklink_hunter_notes_${lead.id}`,
      JSON.stringify(updated)
    );
    setNewNoteText("");
  };

  // Excluir anotação
  const handleDeleteNote = (noteId: string) => {
    const updated = notes.filter((n) => n.id !== noteId);
    setNotes(updated);
    localStorage.setItem(
      `blacklink_hunter_notes_${lead.id}`,
      JSON.stringify(updated)
    );
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

  // Cálculo de dias desde a entrada do lead no funil
  const leadCreatedDay = toStartOfDay(lead.createdAt);
  const currentDay = toStartOfDay(new Date());
  const funnelDays = Math.max(
    0,
    Math.round((currentDay.getTime() - leadCreatedDay.getTime()) / (1000 * 60 * 60 * 24))
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop Translúcido com Blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Painel Lateral Slide-over (Drawer Executivo do Hunter) */}
      <div className="relative z-50 flex h-full w-full max-w-xl flex-col justify-between border-l border-glass-border bg-carbon p-6 shadow-2xl sm:p-8 animate-in slide-in-from-right duration-200">
        <div className="space-y-6 overflow-y-auto pr-1">
          {/* 1. TOPO: Cabeçalho com Nome, Empresa, Cargo e Valor Estimado */}
          <div className="border-b border-glass-border pb-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-md border border-glass-border bg-carbon-muted px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest text-sub">
                  Dossiê do Hunter
                </span>
                <span className="text-[10px] font-mono text-sub">
                  ID: {lead.id.slice(0, 8)}...
                </span>
              </div>
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

            {/* Grid Executivo: Cargo e Valor Estimado */}
            <div className="grid grid-cols-2 gap-3 pt-2">
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
            </div>

            {/* Ação para alternar edição dos metadados */}
            <div className="flex justify-end">
              {isEditingMeta ? (
                <button
                  type="button"
                  onClick={handleSaveMeta}
                  className="text-[11px] font-mono text-accent hover:underline cursor-pointer"
                >
                  Salvar Metadados
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

            {/* Contatos e Entrada no Funil */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-sub">
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

          {/* 2. CADÊNCIA TEMPORAL DINÂMICA (Sensível a createdAt) */}
          <div className="rounded-xl border border-glass-border bg-void/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-accent" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-platinum">
                  Cadência Temporal Dinâmica
                </h3>
              </div>
              <span className="text-[11px] font-mono text-platinum font-semibold">
                {completedCadence.length}/{CADENCE_STEPS.length} ({cadenceProgress}%)
              </span>
            </div>

            {/* Informação de entrada temporal no funil */}
            <div className="flex items-center justify-between text-[10px] font-mono text-sub border-b border-glass-border/60 pb-2">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-sub" />
                <span>Entrada: {formatDate(lead.createdAt)}</span>
              </div>
              <span className="text-platinum">
                {funnelDays === 0
                  ? "Entrou hoje no funil"
                  : funnelDays === 1
                  ? "Há 1 dia no funil"
                  : `Há ${funnelDays} dias no funil`}
              </span>
            </div>

            {/* Barra de Progresso Visual */}
            <div className="h-1.5 w-full rounded-full bg-carbon-muted overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${cadenceProgress}%` }}
              />
            </div>

            {/* Lista de Passos da Cadência com Status Temporal Dinâmico */}
            <div className="space-y-2 pt-1">
              {CADENCE_STEPS.map((step) => {
                const isChecked = completedCadence.includes(step.id);
                const temporal = calculateStepTemporalStatus(
                  lead.createdAt,
                  step.dayOffset,
                  isChecked
                );

                return (
                  <div
                    key={step.id}
                    onClick={() => toggleCadenceStep(step.id)}
                    className={`flex items-start gap-3 rounded-lg border p-2.5 transition-all cursor-pointer select-none ${
                      isChecked
                        ? "border-emerald-500/30 bg-emerald-500/10 text-platinum"
                        : temporal.type === "overdue"
                        ? "border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 text-platinum"
                        : temporal.type === "today"
                        ? "border-amber-400/30 bg-amber-400/5 hover:bg-amber-400/10 text-platinum"
                        : "border-glass-border bg-carbon hover:border-glass-highlight hover:bg-carbon-muted/40 text-sub"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                        isChecked
                          ? "border-emerald-400 bg-emerald-400 text-void font-bold"
                          : "border-glass-border bg-void"
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="h-3 w-3" />}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent">
                            {step.dayLabel}
                          </span>
                          <span
                            className={`text-xs font-semibold ${
                              isChecked
                                ? "text-platinum line-through opacity-70"
                                : "text-platinum"
                            }`}
                          >
                            {step.title}
                          </span>
                        </div>

                        {/* Tag Visual Dinâmica de Tempo */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-mono text-sub">
                            {formatShortDate(temporal.targetDate)}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-mono uppercase border ${temporal.badgeClass}`}
                          >
                            {temporal.type === "overdue" && (
                              <AlertCircle className="h-2.5 w-2.5" />
                            )}
                            {temporal.type === "today" && (
                              <Zap className="h-2.5 w-2.5" />
                            )}
                            {temporal.type === "completed" && (
                              <CheckCircle2 className="h-2.5 w-2.5" />
                            )}
                            <span>{temporal.tag}</span>
                          </span>
                        </div>
                      </div>

                      <p className="text-[10px] text-sub leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. SCRIPT DINÂMICO DE ABORDAGEM (INTERPOLAÇÃO IMEDIATA) */}
          <div className="rounded-xl border border-glass-border bg-void/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-platinum" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-platinum">
                  Script de Abordagem (Pronto para Uso)
                </h3>
              </div>
              <button
                type="button"
                onClick={handleResetScript}
                title="Restaurar script padrão imediatamente interpolado"
                className="flex items-center gap-1 text-[10px] font-mono text-sub hover:text-platinum transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Restaurar Padrão</span>
              </button>
            </div>

            {/* Badges de Inserção Rápida com Valores Reais */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-mono text-sub mr-1">
                Inserir valor:
              </span>
              {[
                { label: "Nome", val: parsed.name },
                { label: "Empresa", val: parsed.company },
                { label: "Cargo", val: roleTitle },
                { label: "Valor", val: estimatedValue },
              ].map(({ label, val }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleInsertResolvedVariable(val)}
                  title={`Inserir "${val}"`}
                  className="rounded border border-glass-border bg-carbon px-2 py-0.5 text-[10px] font-mono text-sub hover:text-accent hover:border-accent/40 transition-colors cursor-pointer"
                >
                  +{label} ({val.length > 15 ? val.slice(0, 15) + "..." : val})
                </button>
              ))}
            </div>

            {/* Textarea já com o texto interpolado e pronto para edição direta */}
            <div className="space-y-2">
              <textarea
                rows={7}
                value={scriptText}
                onChange={(e) => handleScriptChange(e.target.value)}
                className="w-full rounded-lg border border-glass-border bg-carbon p-3 text-xs text-platinum font-mono leading-relaxed focus:border-accent focus:outline-none resize-none"
                placeholder="Script de abordagem pronto para o contato..."
              />

              {/* Botão Copiar Script com Feedback */}
              <button
                type="button"
                onClick={handleCopyScript}
                className="w-full flex h-9 items-center justify-center gap-2 rounded-md bg-accent text-void text-xs font-semibold hover:bg-accent-hover transition-colors cursor-pointer shadow-md"
              >
                {isCopied ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Script Copiado com Sucesso!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copiar Script Pronto</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 4. HISTÓRICO DE ANOTAÇÕES (LOG DE NOTAS) */}
          <div className="rounded-xl border border-glass-border bg-void/50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-platinum" />
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-platinum">
                Histórico & Anotações
              </h3>
            </div>

            {/* Input para Nova Anotação */}
            <div className="space-y-2">
              <textarea
                rows={2}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="w-full rounded-lg border border-glass-border bg-carbon p-2.5 text-xs text-platinum font-mono focus:border-accent focus:outline-none resize-none"
                placeholder="Registrar anotação rápida, feedback de ligação ou objeção..."
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddNote}
                  disabled={!newNoteText.trim()}
                  className="flex h-8 items-center gap-1.5 rounded-md border border-glass-border bg-carbon px-3 text-xs font-mono text-platinum hover:bg-carbon-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>Salvar Anotação</span>
                </button>
              </div>
            </div>

            {/* Lista Cronológica de Anotações */}
            <div className="space-y-2 pt-2">
              {notes.length === 0 ? (
                <div className="text-center py-4 text-xs font-mono text-sub">
                  Nenhuma anotação registrada ainda.
                </div>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg border border-glass-border bg-carbon p-3 space-y-1 group"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-sub">
                      <span>{note.author}</span>
                      <div className="flex items-center gap-2">
                        <span>{formatDate(note.createdAt)}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          title="Remover anotação"
                          className="opacity-0 group-hover:opacity-100 text-sub hover:text-red-400 transition-opacity cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-platinum leading-relaxed whitespace-pre-wrap">
                      {note.text}
                    </p>
                  </div>
                ))
              )}
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
