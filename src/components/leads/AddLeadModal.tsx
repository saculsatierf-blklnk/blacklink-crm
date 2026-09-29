"use client";

import { useState, useEffect, useTransition } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
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
  getCompanyOperatorsAction,
  type CollisionCheckResult,
} from "@/actions/leads";
import { OPERATORS, type Operator } from "@/lib/operators";

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCreated: (newLead: Lead) => void;
  defaultOwnerId?: string;
  operators?: Operator[];
}

const COUNTRY_CODES = [
  { code: "+55", label: "Brasil", flag: "🇧🇷" },
  { code: "+1", label: "EUA / Canadá", flag: "🇺🇸" },
  { code: "+351", label: "Portugal", flag: "🇵🇹" },
  { code: "+34", label: "Espanha", flag: "🇪🇸" },
  { code: "+44", label: "Reino Unido", flag: "🇬🇧" },
  { code: "+54", label: "Argentina", flag: "🇦🇷" },
  { code: "+598", label: "Uruguai", flag: "🇺🇾" },
  { code: "+56", label: "Chile", flag: "🇨🇱" },
  { code: "+57", label: "Colômbia", flag: "🇨🇴" },
  { code: "+52", label: "México", flag: "🇲🇽" },
];

function formatBRPhone(rawDigits: string): string {
  const digits = rawDigits.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function AddLeadModal({
  isOpen,
  onClose,
  onLeadCreated,
  defaultOwnerId,
  operators: propOperators,
}: AddLeadModalProps) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [email, setEmail] = useState("");
  const [selectedDdi, setSelectedDdi] = useState("+55");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [ownerId, setOwnerId] = useState(defaultOwnerId || "");
  const [initialNote, setInitialNote] = useState("");

  // Operadores dinâmicos da base
  const [operatorsList, setOperatorsList] = useState<Operator[]>(
    propOperators && propOperators.length > 0 ? propOperators : OPERATORS
  );

  // Estado do Radar Anti-Colisão
  const [isCheckingCollision, setIsCheckingCollision] = useState(false);
  const [collisionResult, setCollisionResult] = useState<CollisionCheckResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Carrega operadores reais vinculados ao tenant no PostgreSQL
  useEffect(() => {
    if (propOperators && propOperators.length > 0) {
      setOperatorsList(propOperators);
      if (!ownerId && propOperators[0]?.id) {
        setOwnerId(propOperators[0].id);
      }
      return;
    }

    getCompanyOperatorsAction().then((ops) => {
      if (ops && ops.length > 0) {
        setOperatorsList(ops);
        setOwnerId((prev) => {
          if (!prev || prev === "todos" || prev === "lucas.leite" || !ops.some((o) => o.id === prev)) {
            return ops[0].id;
          }
          return prev;
        });
      }
    });
  }, [propOperators, isOpen]);

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

  const handlePhoneChange = (val: string) => {
    if (selectedDdi === "+55") {
      setPhoneNumber(formatBRPhone(val));
    } else {
      setPhoneNumber(val);
    }
  };

  const handleDdiChange = (newDdi: string) => {
    setSelectedDdi(newDdi);
    if (newDdi === "+55") {
      setPhoneNumber(formatBRPhone(phoneNumber));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isPending) return;

    setSubmitError(null);

    const fullPhone = phoneNumber.trim() ? `${selectedDdi} ${phoneNumber.trim()}` : undefined;

    startTransition(async () => {
      const res = await createLeadAction({
        name,
        company,
        roleTitle,
        email,
        phone: fullPhone,
        ownerId: ownerId || undefined,
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
    setSelectedDdi("+55");
    setPhoneNumber("");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={handleResetAndClose}
        className="fixed inset-0 transition-opacity"
      />

      {/* Conteúdo do Modal */}
      <div className="relative z-50 flex flex-col w-full max-w-2xl max-h-[90vh] rounded-3xl border border-white/[0.12] bg-[#0A0A0A]/95 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl overflow-y-auto space-y-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        {/* Cabeçalho */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              <h2 className="text-lg font-medium text-white tracking-tight">
                Cadastrar Nova Conta / Lead
              </h2>
            </div>
            <p className="text-xs text-zinc-400">
              Preencha os dados do decisor. O radar anti-colisão verifica e-mail e domínio em tempo real.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
          {submitError && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs font-mono text-rose-300">
              {submitError}
            </div>
          )}

          {/* Linha 1: Nome do Contato e Empresa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 block">
                Nome do Decisor *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Roberto Silveira"
                  className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:border-white/30 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 block">
                Empresa / Organização *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Ex: Apex Capital Holding"
                  className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:border-white/30 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Linha 2: E-mail Corporativo (com Radar Anti-Colisão) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 block">
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
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: roberto@apexcapital.io"
                className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none transition-colors ${
                  hasCollision
                    ? "border-rose-500/80 bg-rose-500/10 focus:border-rose-400"
                    : "border-white/10 bg-black/20 focus:border-white/30"
                }`}
              />
            </div>
          </div>

          {/* CARD DE AVISO DE COLISÃO EXPANDIDO */}
          {hasCollision && collisionResult?.collidedLead && (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-950/20 p-4.5 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-medium uppercase tracking-wider text-rose-300">
                    Bloqueio Anti-Colisão: Conta Já Mapeada no Sistema
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2.5 border-t border-rose-500/20 text-[11px] font-mono">
                <div className="rounded-xl bg-black/40 p-2.5 border border-rose-500/20">
                  <span className="text-[10px] text-zinc-500 uppercase block">Dono da Conta</span>
                  <span className="font-medium text-white truncate block">
                    {collisionResult.collidedLead.ownerName}
                  </span>
                </div>

                <div className="rounded-xl bg-black/40 p-2.5 border border-rose-500/20">
                  <span className="text-[10px] text-zinc-500 uppercase block">Status no Funil</span>
                  <span className="font-medium text-amber-300 truncate block">
                    {getStatusLabel(collisionResult.collidedLead.status)}
                  </span>
                </div>

                <div className="rounded-xl bg-black/40 p-2.5 border border-rose-500/20">
                  <span className="text-[10px] text-zinc-500 uppercase block">Registro Existente</span>
                  <span className="font-medium text-white truncate block">
                    {collisionResult.collidedLead.leadName}
                  </span>
                </div>
              </div>

              {/* Histórico Completo de Anotações do Lead Conflitante */}
              {collisionResult.collidedLead.notes &&
                collisionResult.collidedLead.notes.length > 0 && (
                  <div className="space-y-2 pt-2.5 border-t border-rose-500/20">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                      Histórico de Anotações da Conta ({collisionResult.collidedLead.notes.length})
                    </span>
                    <div className="max-h-28 overflow-y-auto space-y-2 pr-1">
                      {collisionResult.collidedLead.notes.map((note: NoteEntry) => (
                        <div
                          key={note.id}
                          className="rounded-xl bg-black/50 p-2.5 text-[10px] font-mono border border-rose-500/20 text-zinc-400"
                        >
                          <div className="flex items-center justify-between text-[9px] text-zinc-500 pb-1">
                            <span className="font-medium text-zinc-300">{note.author}</span>
                            <span>{formatShortDate(note.createdAt)}</span>
                          </div>
                          <div className="text-zinc-200 whitespace-pre-wrap">{note.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Linha 3: Cargo e Telefone / WhatsApp com DDI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 block">
                Cargo / Função
              </label>
              <div className="relative">
                <UserCheck className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="Ex: Diretor de Operações"
                  className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:border-white/30 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 block">
                Telefone / WhatsApp
              </label>
              <div className="flex rounded-xl border border-white/10 bg-black/20 focus-within:border-white/30 overflow-hidden transition-colors">
                <select
                  value={selectedDdi}
                  onChange={(e) => handleDdiChange(e.target.value)}
                  className="bg-transparent px-3 py-2.5 text-xs font-mono text-white border-r border-white/10 focus:outline-none cursor-pointer"
                >
                  {COUNTRY_CODES.map((item) => (
                    <option key={item.code} value={item.code} className="bg-[#0A0A0A] text-white">
                      {item.flag} {item.code}
                    </option>
                  ))}
                </select>
                <div className="relative flex-1 flex items-center">
                  <Phone className="absolute left-3 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder={selectedDdi === "+55" ? "(11) 9XXXX-XXXX" : "Número de telefone"}
                    className="w-full bg-transparent pl-9 pr-4 py-2.5 text-xs font-mono text-white placeholder:text-zinc-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Linha 4: Operador Responsável (Dono Dinâmico) */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 block">
              Operador Responsável (Dono)
            </label>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:border-white/30 focus:outline-none transition-colors cursor-pointer"
            >
              {operatorsList.map((op) => (
                <option key={op.id} value={op.id} className="bg-[#0A0A0A] text-white">
                  {op.name} ({op.role})
                </option>
              ))}
            </select>
          </div>

          {/* Linha 5: Anotação Inicial */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 block">
              Anotação Inicial da Conta (Opcional)
            </label>
            <div className="relative">
              <textarea
                value={initialNote}
                onChange={(e) => setInitialNote(e.target.value)}
                rows={2}
                placeholder="Contexto da prospecção, canal de abordagem ou detalhes preliminares..."
                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-zinc-500 focus:border-white/30 focus:outline-none transition-colors resize-y"
              />
            </div>
          </div>

          {/* Rodapé com Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-white/10">
            <button
              type="button"
              onClick={handleResetAndClose}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2.5 text-xs text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!isFormValid || isPending}
              className={`rounded-xl px-6 py-2.5 text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                hasCollision
                  ? "border border-rose-500/40 bg-rose-500/20 text-rose-300 opacity-60 cursor-not-allowed"
                  : isFormValid
                  ? "bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  : "bg-white/[0.05] text-zinc-500 opacity-50 cursor-not-allowed"
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
