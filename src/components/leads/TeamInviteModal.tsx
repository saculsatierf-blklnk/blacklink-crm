"use client";

import { useEffect, useState, useTransition } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Link as LinkIcon,
  Mail,
  Shield,
  Target,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import {
  createTeamMemberAction,
  getCompanyMembersAction,
  type TeamMember,
} from "@/actions/auth";

interface TeamInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  companyId?: string;
  currentUserId?: string;
  onMemberAdded?: () => void;
}

export function TeamInviteModal({
  isOpen,
  onClose,
  companyName,
  companyId,
  currentUserId,
  onMemberAdded,
}: TeamInviteModalProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("363900");
  const [role, setRole] = useState<"commercial" | "admin">("commercial");

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Load members on modal open
  useEffect(() => {
    if (!isOpen) return;
    setIsLoadingMembers(true);
    setFormError(null);
    setFormSuccess(null);

    getCompanyMembersAction()
      .then((res) => {
        if (res.success && res.members) {
          setMembers(res.members);
        }
      })
      .finally(() => setIsLoadingMembers(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/register?company=${encodeURIComponent(
          companyName || "Gofer Metais"
        )}${companyId ? `&companyId=${companyId}` : ""}`
      : "";

  const handleCopyLink = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setFormError("Preencha todos os campos do formulário.");
      return;
    }

    setFormError(null);
    setFormSuccess(null);

    startTransition(async () => {
      const res = await createTeamMemberAction({
        fullName: fullName.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
      });

      if (!res.success) {
        setFormError(res.error || "Erro ao cadastrar membro da equipe.");
      } else {
        setFormSuccess(`Operador ${fullName} cadastrado com sucesso!`);
        setFullName("");
        setEmail("");
        setPassword("363900");

        // Atualiza a lista de membros
        getCompanyMembersAction().then((mRes) => {
          if (mRes.success && mRes.members) {
            setMembers(mRes.members);
          }
        });

        if (onMemberAdded) onMemberAdded();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0c0c10] p-6 lg:p-8 shadow-2xl backdrop-blur-2xl text-zinc-100 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.08] border border-white/[0.15] text-white">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-white">
                Equipe Comercial • {companyName || "Gofer Metais"}
              </h2>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Convide operadores de vendas. Cada um opera seu próprio Kanban exclusivo sem cruzar dados.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/[0.06] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1">
          {/* Box de Link de Convite Direto */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <LinkIcon className="h-3.5 w-3.5 text-emerald-400" />
                Link de Convite para a {companyName}
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                Cadastro direto vinculado
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="h-9 flex-1 rounded-lg border border-white/[0.08] bg-black/40 px-3 text-xs font-mono text-zinc-300 select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-black hover:bg-zinc-200 transition-colors shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copiar Link</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-zinc-500">
              Envie esse link para o Jorge ou qualquer novo membro. Ele já entrará diretamente vinculado à equipe da {companyName}.
            </p>
          </div>

          {/* Formulário: Cadastrar Imediatamente */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <UserPlus className="h-3.5 w-3.5 text-emerald-400" />
                Cadastrar Novo Membro Agora
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                Acesso Imediato
              </span>
            </div>

            {formError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateMember} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nome */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Ex: Jorge"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isPending}
                      className="h-9 w-full rounded-lg border border-white/[0.08] bg-black/40 pl-9 pr-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-white/30 focus:outline-none"
                    />
                  </div>
                </div>

                {/* E-mail */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                    E-mail de Acesso *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                      type="email"
                      placeholder="jorge@gofermetais.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isPending}
                      className="h-9 w-full rounded-lg border border-white/[0.08] bg-black/40 pl-9 pr-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-white/30 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Senha Inicial */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                    Chave de Acesso (Senha) *
                  </label>
                  <input
                    type="text"
                    placeholder="363900"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isPending}
                    className="h-9 w-full rounded-lg border border-white/[0.08] bg-black/40 px-3 text-xs font-mono text-zinc-200 focus:border-white/30 focus:outline-none"
                  />
                </div>

                {/* Cargo */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                    Função na Conta *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as "commercial" | "admin")}
                    disabled={isPending}
                    className="h-9 w-full rounded-lg border border-white/[0.08] bg-black/40 px-3 text-xs text-zinc-200 focus:border-white/30 focus:outline-none"
                  >
                    <option value="commercial">Comercial (Kanban Pessoal Exclusivo)</option>
                    <option value="admin">Administrador (Gestão de Equipe)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 text-xs font-semibold text-black hover:bg-emerald-400 transition-colors disabled:opacity-50"
              >
                {isPending ? (
                  <span className="font-mono">Cadastrando...</span>
                ) : (
                  <>
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Confirmar Cadastro do Operador</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Lista de Membros Atuais */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 block">
              Membros Atuais da Equipe ({members.length})
            </span>

            {isLoadingMembers ? (
              <div className="py-4 text-center font-mono text-xs text-zinc-500">
                Carregando membros...
              </div>
            ) : members.length === 0 ? (
              <div className="py-4 text-center font-mono text-xs text-zinc-500">
                Nenhum membro listado além da sessão ativa.
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {members.map((m) => {
                  const isYou = m.id === currentUserId;
                  const isCommercial = m.role === "commercial";

                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] border border-white/[0.1] font-mono text-xs font-bold text-white">
                          {m.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-white">
                              {m.fullName}
                            </span>
                            {isYou && (
                              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300">
                                Você
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-zinc-500">
                            {m.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase ${
                            isCommercial
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          }`}
                        >
                          {isCommercial ? "Comercial" : "Admin"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.08] pt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/[0.08] transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
