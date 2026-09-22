"use client";

import { useState, useEffect, useTransition } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Coins,
  FileText,
  Mail,
  Phone,
  Radar,
  ShieldAlert,
  User,
  UserCheck,
  X,
} from "lucide-react";
import type { Lead, NoteEntry } from "@/db/schema";
import {
  checkLeadCollisionAction,
  createLeadAction,
  type CollisionCheckResult,
} from "@/actions/leads";
import { OPERATORS } from "@/lib/operators";

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCreated: (newLead: Lead) => void;
  defaultOwnerId?: string;
}

export function AddLeadModal({
  isOpen,
  onClose,
  onLeadCreated,
  defaultOwnerId = "lucas.leite",
}: AddLeadModalProps) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [ownerId, setOwnerId] = useState(defaultOwnerId);
  const [initialNote, setInitialNote] = useState("");

  // Estado do Radar Anti-Colisão
  const [isCheckingCollision, setIsCheckingCollision] = useState(false);
  const [collisionResult, setCollisionResult] = useState<CollisionCheckResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Atualiza defaultOwner quando alterado externamente
  useEffect(() => {
    if (defaultOwnerId && defaultOwnerId !== "todos") {
      setOwnerId(defaultOwnerId);
    }
  }, [defaultOwnerId]);

  // Radar Anti-Colisão: Execução em tempo real com debounce de 350ms
  useEffect(() => {
    if (!email.trim() || !email.includes("@")) {
      setCollisionResult(null);
      setIsCheckingCollision(false);
      return;
    }

    setIsCheckingCollision(true);
    const timer = setTimeout(async () => {
      try {
        const result = await checkLeadCollisionAction(email.trim());
        setCollisionResult(result);
      } catch (err) {
        console.error("Falha no radar de colisão:", err);
      } finally {
        setIsCheckingCollision(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [email]);

  if (!isOpen) return null;

  const hasCollision = collisionResult?.collision === true;
  const isFormValid =
    name.trim().length > 0 &&
    company.trim().length > 0 &&
    email.trim().length > 0 &&
    !hasCollision;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isPending) return;

    setSubmitError(null);

    startTransition(async () => {
      const res = await createLeadAction({
        name,
        company,
        roleTitle,
        email,
        phone,
        estimatedValue,
        ownerId,
        initialNote,
      });

      if (res.success && res.lead) {
        onLeadCreated(res.lead);
        handleResetAndClose();
      } else {
        setSubmitError(res.error || "Falha ao cadastrar lead no banco.");
      }
    });
  };

  const handleResetAndClose = () => {
    setName("");
    setCompany("");
    setRoleTitle("");
    setEmail("");
    setPhone("");
    setEstimatedValue("");
    setInitialNote("");
    setCollisionResult(null);
    setSubmitError(null);
    onClose();
  };

  const formatShortDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch {
      return dateString;
    }
  };

  const getStatusLabel = (status?: string) => {
    if (status === "negotiation") return "Em Prospecção";
    if (status === "closed") return "Fechado";
    return "Novo Lead";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={handleResetAndClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
      />

      {/* Conteúdo do Modal */}
      <div className="relative z-50 flex flex-col w-full max-w-2xl max-h-[90vh] rounded-xl border border-glass-border bg-carbon p-6 shadow-2xl overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-glass-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-accent" />
              <h2 className="text-base font-bold text-platinum tracking-tight uppercase font-mono">
                Cadastrar Nova Conta / Lead
              </h2>
            </div>
            <p className="text-xs text-sub">
              Preencha os dados do decisor. O radar anti-colisão verifica e-mail e domínio em tempo real.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-glass-border bg-carbon-muted text-sub hover:text-platinum transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {submitError && (
            <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-xs font-mono text-rose-300">
              {submitError}
            </div>
          )}

          {/* Linha 1: Nome do Contato e Empresa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-sub block">
                Nome do Decisor *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-sub" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Roberto Silveira"
                  className="w-full rounded-md border border-glass-border bg-carbon-muted pl-9 pr-3 py-2 text-xs font-mono text-platinum placeholder:text-sub/50 focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-sub block">
                Empresa / Organização *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-3.5 w-3.5 text-sub" />
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Ex: Apex Capital Holding"
                  className="w-full rounded-md border border-glass-border bg-carbon-muted pl-9 pr-3 py-2 text-xs font-mono text-platinum placeholder:text-sub/50 focus:border-accent focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Linha 2: E-mail Corporativo (com Radar Anti-Colisão) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono uppercase tracking-wider text-sub block">
                E-mail Corporativo *
              </label>
              <div className="flex items-center gap-1.5 text-[10px] font-mono">
                {isCheckingCollision ? (
                  <span className="flex items-center gap-1 text-amber-300">
                    <Radar className="h-3 w-3 animate-spin" />
                    Varrendo radar de contas...
                  </span>
                ) : hasCollision ? (
                  <span className="flex items-center gap-1 text-rose-400 font-bold">
                    <AlertTriangle className="h-3 w-3" />
                    Colisão Detectada
                  </span>
                ) : email.trim().includes("@") ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="h-3 w-3" />
                    Conta Inédita (Livre)
                  </span>
                ) : null}
              </div>
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-sub" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: roberto@apexcapital.io"
                className={`w-full rounded-md border pl-9 pr-3 py-2 text-xs font-mono text-platinum placeholder:text-sub/50 focus:outline-none ${
                  hasCollision
                    ? "border-rose-500/80 bg-rose-500/10 focus:border-rose-400"
                    : "border-glass-border bg-carbon-muted focus:border-accent"
                }`}
              />
            </div>
          </div>

          {/* CARD DE AVISO DE COLISÃO EXPANDIDO */}
          {hasCollision && collisionResult?.collidedLead && (
            <div className="rounded-xl border border-rose-500/60 bg-rose-950/30 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-rose-300">
                    Bloqueio Anti-Colisão: Conta Já Mapeada no Sistema
                  </div>
                  <p className="text-[11px] text-platinum/90 leading-relaxed">
                    Identificamos que este e-mail ou domínio corporativo (
                    <span className="font-mono text-rose-300 font-semibold">
                      @{collisionResult.domain}
                    </span>
                    ) já pertence a outro operador ativo. Para evitar duplicidade de contato, o cadastro
                    está bloqueado.
                  </p>
                </div>
              </div>

              {/* Dossiê do Lead Conflitante */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-rose-500/30 text-[11px] font-mono">
                <div className="rounded bg-black/40 p-2 border border-rose-500/20">
                  <span className="text-[10px] text-sub uppercase block">Dono da Conta</span>
                  <span className="font-bold text-platinum truncate block">
                    {collisionResult.collidedLead.ownerName}
                  </span>
                </div>

                <div className="rounded bg-black/40 p-2 border border-rose-500/20">
                  <span className="text-[10px] text-sub uppercase block">Status no Funil</span>
                  <span className="font-bold text-amber-300 truncate block">
                    {getStatusLabel(collisionResult.collidedLead.status)}
                  </span>
                </div>

                <div className="rounded bg-black/40 p-2 border border-rose-500/20">
                  <span className="text-[10px] text-sub uppercase block">Registro Existente</span>
                  <span className="font-semibold text-platinum truncate block">
                    {collisionResult.collidedLead.leadName}
                  </span>
                </div>
              </div>

              {/* Histórico Completo de Anotações do Lead Conflitante */}
              {collisionResult.collidedLead.notes &&
                collisionResult.collidedLead.notes.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-rose-500/30">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-sub block">
                      Histórico de Anotações da Conta ({collisionResult.collidedLead.notes.length})
                    </span>
                    <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                      {collisionResult.collidedLead.notes.map((note: NoteEntry) => (
                        <div
                          key={note.id}
                          className="rounded bg-black/50 p-2 text-[10px] font-mono border border-rose-500/20 text-sub"
                        >
                          <div className="flex items-center justify-between text-[9px] text-sub/70 pb-1">
                            <span className="font-semibold text-platinum">{note.author}</span>
                            <span>{formatShortDate(note.createdAt)}</span>
                          </div>
                          <div className="text-platinum whitespace-pre-wrap">{note.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Linha 3: Cargo e Valor Estimado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-sub block">
                Cargo / Função
              </label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-2.5 h-3.5 w-3.5 text-sub" />
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="Ex: Diretor de Operações"
                  className="w-full rounded-md border border-glass-border bg-carbon-muted pl-9 pr-3 py-2 text-xs font-mono text-platinum placeholder:text-sub/50 focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-sub block">
                Valor Estimado
              </label>
              <div className="relative">
                <Coins className="absolute left-3 top-2.5 h-3.5 w-3.5 text-accent" />
                <input
                  type="text"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  placeholder="Ex: R$ 50.000,00"
                  className="w-full rounded-md border border-glass-border bg-carbon-muted pl-9 pr-3 py-2 text-xs font-mono text-platinum placeholder:text-sub/50 focus:border-accent focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Linha 4: Telefone e Operador Responsável */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-sub block">
                Telefone / WhatsApp
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-sub" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: +55 (11) 98765-4321"
                  className="w-full rounded-md border border-glass-border bg-carbon-muted pl-9 pr-3 py-2 text-xs font-mono text-platinum placeholder:text-sub/50 focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-sub block">
                Operador Responsável (Dono)
              </label>
              <select
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                className="w-full rounded-md border border-glass-border bg-carbon-muted px-3 py-2 text-xs font-mono text-platinum focus:border-accent focus:outline-none cursor-pointer"
              >
                {OPERATORS.map((op) => (
                  <option key={op.id} value={op.id} className="bg-carbon text-platinum">
                    {op.name} ({op.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Linha 5: Anotação Inicial */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-sub block">
              Anotação Inicial da Conta (Opcional)
            </label>
            <div className="relative">
              <textarea
                value={initialNote}
                onChange={(e) => setInitialNote(e.target.value)}
                rows={2}
                placeholder="Contexto da prospecção, canal de abordagem ou detalhes preliminares..."
                className="w-full rounded-md border border-glass-border bg-carbon-muted p-2.5 text-xs font-mono text-platinum placeholder:text-sub/50 focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          {/* Rodapé com Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-glass-border">
            <button
              type="button"
              onClick={handleResetAndClose}
              className="rounded-md border border-glass-border bg-carbon px-4 py-2 text-xs font-mono text-sub hover:text-platinum transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!isFormValid || isPending}
              className={`rounded-md px-5 py-2 text-xs font-mono font-bold transition-all cursor-pointer ${
                hasCollision
                  ? "border border-rose-500/40 bg-rose-500/20 text-rose-300 opacity-60 cursor-not-allowed"
                  : isFormValid
                  ? "bg-accent text-void hover:bg-platinum shadow-md"
                  : "bg-carbon-muted text-sub opacity-50 cursor-not-allowed"
              }`}
            >
              {isPending
                ? "Cadastrando..."
                : hasCollision
                ? "Bloqueado por Colisão"
                : "Cadastrar Conta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
