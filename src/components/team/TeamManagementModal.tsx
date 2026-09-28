"use client";

import { useEffect, useState, useTransition } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Lock,
  Mail,
  Plus,
  Shield,
  Trash2,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import {
  createTeamMemberAction,
  deleteTeamMemberAction,
  getCompanyMembersAction,
  type TeamMember,
} from "@/actions/auth";

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
  onMembersUpdated?: () => void;
}

export function TeamManagementModal({
  isOpen,
  onClose,
  currentUserId,
  onMembersUpdated,
}: TeamManagementModalProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"commercial" | "admin">("commercial");
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const res = await getCompanyMembersAction();
      if (res.success) {
        setMembers(res.members);
      } else if (res.error) {
        setError(res.error);
      }
    } catch {
      setError("Falha ao carregar lista de membros.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMembers();
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    setError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const res = await createTeamMemberAction({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role,
      });

      if (res.success && res.member) {
        setMembers((prev) => [...prev, res.member!]);
        setFullName("");
        setEmail("");
        setPassword("");
        setIsAdding(false);
        setSuccessMessage(`Operador ${res.member.fullName} cadastrado com sucesso!`);
        if (onMembersUpdated) onMembersUpdated();
      } else {
        setError(res.error || "Não foi possível cadastrar o operador.");
      }
    });
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm("Confirma a exclusão deste operador da empresa?")) return;

    setError(null);
    setSuccessMessage(null);

    const res = await deleteTeamMemberAction(memberId);
    if (res.success) {
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      setSuccessMessage("Membro removido da equipe.");
      if (onMembersUpdated) onMembersUpdated();
    } else {
      setError(res.error || "Falha ao remover o membro.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
      />

      {/* Modal */}
      <div className="relative z-50 flex flex-col w-full max-w-2xl max-h-[90vh] rounded-xl border border-glass-border bg-carbon p-6 shadow-2xl overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-glass-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              <h2 className="text-base font-bold font-mono uppercase tracking-wider text-platinum">
                Gestão da Equipe & Operadores
              </h2>
            </div>
            <p className="text-xs text-sub">
              Cadastre novos operadores comerciais ou administradores para atuarem nas contas da empresa.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-glass-border bg-carbon-muted text-sub hover:text-platinum transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mensagens de Feedback */}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Botão para Exibir/Ocultar Formulário de Cadastro */}
        <div className="mt-5 flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-sub">
            Membros Cadastrados ({members.length})
          </span>
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 rounded-md border border-glass-border bg-carbon-muted px-3 py-1.5 text-xs font-mono text-platinum hover:border-accent/40 transition-colors cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5 text-accent" />
            <span>{isAdding ? "Cancelar Cadastro" : "+ Novo Membro"}</span>
          </button>
        </div>

        {/* Formulário de Cadastro de Novo Membro */}
        {isAdding && (
          <form
            onSubmit={handleCreateMember}
            className="mt-4 space-y-4 rounded-xl border border-glass-border bg-void/60 p-4 animate-in fade-in slide-in-from-top-2 duration-150"
          >
            <div className="flex items-center justify-between border-b border-glass-border/50 pb-2">
              <span className="text-xs font-semibold text-platinum">
                Cadastrar Operador na Empresa
              </span>
              <span className="text-[10px] font-mono text-sub">Acesso Imediato</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Nome */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-sub block">
                  Nome Completo *
                </label>
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-sub" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Carlos Mendes"
                    disabled={isPending}
                    className="h-9 w-full rounded border border-glass-border bg-carbon pl-8 pr-3 text-xs text-platinum placeholder:text-sub focus:border-accent focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* E-mail */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-sub block">
                  E-mail Corporativo *
                </label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-sub" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operador@empresa.com"
                    disabled={isPending}
                    className="h-9 w-full rounded border border-glass-border bg-carbon pl-8 pr-3 text-xs text-platinum placeholder:text-sub focus:border-accent focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Senha */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-sub block">
                  Chave de Acesso (Senha) *
                </label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-sub" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    disabled={isPending}
                    className="h-9 w-full rounded border border-glass-border bg-carbon pl-8 pr-3 text-xs text-platinum placeholder:text-sub focus:border-accent focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Perfil de Acesso */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-sub block">
                  Perfil de Acesso (Função) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("commercial")}
                    className={`flex items-center justify-center gap-1.5 rounded border p-2 text-xs font-mono transition-all cursor-pointer ${
                      role === "commercial"
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-semibold"
                        : "border-glass-border bg-carbon text-sub hover:text-platinum"
                    }`}
                  >
                    <span>Comercial</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`flex items-center justify-center gap-1.5 rounded border p-2 text-xs font-mono transition-all cursor-pointer ${
                      role === "admin"
                        ? "border-purple-500/50 bg-purple-500/10 text-purple-400 font-semibold"
                        : "border-glass-border bg-carbon text-sub hover:text-platinum"
                    }`}
                  >
                    <span>Administrador</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-glass-border/40">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="rounded border border-glass-border bg-carbon px-3 py-1.5 text-xs text-sub hover:text-platinum cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-1.5 rounded bg-accent px-4 py-1.5 text-xs font-semibold text-void hover:bg-accent-hover cursor-pointer disabled:opacity-50"
              >
                {isPending ? "Cadastrando..." : "Confirmar Cadastro"}
              </button>
            </div>
          </form>
        )}

        {/* Lista de Membros */}
        <div className="mt-4 space-y-2">
          {isLoading ? (
            <div className="py-8 text-center text-xs font-mono text-sub">
              Carregando membros da equipe...
            </div>
          ) : members.length === 0 ? (
            <div className="py-8 text-center text-xs text-sub">
              Nenhum operador adicional cadastrado para esta empresa.
            </div>
          ) : (
            members.map((member) => {
              const isAdmin = member.role === "admin";
              const isCurrentUser = member.id === currentUserId;

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border border-glass-border bg-carbon p-3 hover:border-glass-highlight transition-all"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar com Iniciais */}
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold ${
                        isAdmin
                          ? "border-purple-500/40 bg-purple-500/10 text-purple-300"
                          : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      }`}
                    >
                      {member.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-platinum">
                          {member.fullName}
                        </span>
                        {isCurrentUser && (
                          <span className="rounded bg-accent/10 border border-accent/20 px-1.5 py-0.2 text-[9px] font-mono text-accent">
                            Você
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-sub">
                        <span>{member.email}</span>
                        <span>&bull;</span>
                        <span className="font-mono text-[10px]">
                          {new Date(member.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider border ${
                        isAdmin
                          ? "border-purple-500/40 bg-purple-500/10 text-purple-400"
                          : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                      }`}
                    >
                      {isAdmin ? "Administrador" : "Comercial"}
                    </span>

                    {!isCurrentUser && (
                      <button
                        type="button"
                        onClick={() => handleDeleteMember(member.id)}
                        className="flex h-7 w-7 items-center justify-center rounded border border-glass-border bg-void text-sub hover:text-red-400 hover:border-red-500/40 transition-colors cursor-pointer"
                        title="Remover membro"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
