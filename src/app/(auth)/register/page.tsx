"use client";

import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  MailCheck,
  RefreshCw,
  ShieldCheck,
  Target,
  User,
  Users,
} from "lucide-react";
import {
  registerCompanyAdminAction,
  requestRegistrationCodeAction,
  verifyCodeAndActivateAccountAction,
} from "@/actions/auth";
import {
  registerCompanySchema,
  type RegisterCompanyFormValues,
} from "@/lib/validations/auth";
import { useAuthStore } from "@/store/useAuthStore";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCompany = searchParams.get("company") || "";
  const inviteCompanyId = searchParams.get("companyId") || "";

  const [step, setStep] = useState<"form" | "verify">("form");
  const [serverError, setServerError] = useState<string | null>(null);
  const [targetEmail, setTargetEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const setUser = useAuthStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterCompanyFormValues>({
    resolver: zodResolver(registerCompanySchema),
    defaultValues: {
      companyName: inviteCompany || "Gofer Metais",
      fullName: "",
      email: "",
      password: "",
      role: "commercial",
      inviteCompanyId: inviteCompanyId || undefined,
    },
  });

  const selectedRole = watch("role") || "commercial";

  useEffect(() => {
    if (inviteCompany) {
      setValue("companyName", inviteCompany);
    }
    if (inviteCompanyId) {
      setValue("inviteCompanyId", inviteCompanyId);
    }
  }, [inviteCompany, inviteCompanyId, setValue]);

  // Temporizador para reenvio de chave
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Criação direta e imediata da conta (Recomendado para Gofer Metais e equipe)
  const onDirectSubmit = async (data: RegisterCompanyFormValues) => {
    try {
      setServerError(null);
      const res = await registerCompanyAdminAction(data);

      if (res?.error) {
        setServerError(res.error);
        return;
      }

      if (res?.user) {
        setUser({
          id: res.user.id,
          company_id: res.user.company_id,
          role: res.user.role,
          name: res.user.name,
          email: res.user.email,
        });

        const target = res.destination || (data.role === "commercial" ? "/vendas" : "/");
        router.push(target);
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
        return;
      }
      setServerError("Falha na criação da conta. Verifique os dados inseridos.");
    }
  };

  // Submissão via código por e-mail (fluxo alternativo)
  const onCodeRequest = async () => {
    try {
      setServerError(null);
      const data = getValues();
      if (!data.email || !data.fullName || !data.companyName || !data.password) {
        setServerError("Preencha todos os campos antes de solicitar a chave.");
        return;
      }
      const res = await requestRegistrationCodeAction(data);

      if (res.success && res.email) {
        setTargetEmail(res.email);
        setStep("verify");
        setResendCooldown(60);
      } else {
        setServerError(res.error || "Não foi possível enviar a chave para este e-mail.");
      }
    } catch {
      setServerError("Falha na comunicação com o servidor de autenticação.");
    }
  };

  // Reenvio da chave para o e-mail
  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    try {
      setServerError(null);
      const data = getValues();
      const res = await requestRegistrationCodeAction(data);

      if (res.success) {
        setResendCooldown(60);
      } else {
        setServerError(res.error || "Erro ao reenviar chave.");
      }
    } catch {
      setServerError("Falha ao reenviar chave.");
    }
  };

  // Validação da chave e ativação da conta
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = verificationCode.trim().replace(/\D/g, "");
    if (clean.length !== 6) {
      setServerError("A chave de verificação deve conter 6 dígitos numéricos.");
      return;
    }

    try {
      setServerError(null);
      setIsVerifying(true);

      const res = await verifyCodeAndActivateAccountAction({
        email: targetEmail,
        code: clean,
      });

      if (res?.error) {
        setServerError(res.error);
        setIsVerifying(false);
      } else if (res?.user) {
        setUser({
          id: res.user.id,
          company_id: res.user.company_id,
          role: res.user.role,
          name: res.user.name,
          email: res.user.email,
        });
        router.push(res.destination || "/vendas");
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
        return;
      }
      setServerError("Falha ao validar chave. Tente novamente.");
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-void px-4 py-8 text-platinum">
      <div className="w-full max-w-md space-y-8">
        {/* Marca & Identidade Corporativa */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-void font-bold text-base tracking-widest mb-2 shadow-[0_0_20px_rgba(255,255,255,0.15)]">
            BL
          </div>
          <h1 className="font-mono text-xl font-bold uppercase tracking-wider text-platinum">
            Black Link <span className="text-sub font-normal">CRM</span>
          </h1>
          <p className="text-xs text-sub tracking-tight">
            {inviteCompany
              ? `Cadastro de novo membro para a equipe ${inviteCompany}`
              : "Cadastro corporativo de organização e operadores comerciais"}
          </p>
        </div>

        {/* Card Principal */}
        <div className="rounded-xl border border-glass-border bg-carbon p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between border-b border-glass-border/70 pb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-sub flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-platinum" />
              {step === "form" ? "Novo Cadastro" : "Ativação de Segurança"}
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-semibold">
              {selectedRole === "commercial" ? "Perfil Comercial" : "Administrador"}
            </span>
          </div>

          {/* Mensagem de Erro Geral */}
          {serverError && (
            <div className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">
                <span>{serverError}</span>
                {serverError.includes("já está cadastrado") && (
                  <div className="mt-1.5">
                    <Link
                      href="/login"
                      className="font-semibold text-platinum hover:text-accent underline underline-offset-2"
                    >
                      Acessar tela de login com este e-mail &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === "form" ? (
            <form onSubmit={handleSubmit(onDirectSubmit)} className="space-y-4">
              {/* Seleção de Perfil / Cargo */}
              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] uppercase tracking-wider text-sub">
                  Função na Conta *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setValue("role", "commercial")}
                    className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      selectedRole === "commercial"
                        ? "border-accent bg-accent/10 text-platinum shadow-sm"
                        : "border-glass-border bg-void/50 text-sub hover:border-glass-highlight"
                    }`}
                  >
                    <span className="text-xs font-semibold text-platinum flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5 text-emerald-400" />
                      Comercial
                    </span>
                    <span className="text-[10px] text-sub mt-0.5 leading-tight">
                      Kanban limpo e pipeline pessoal
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setValue("role", "admin")}
                    className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      selectedRole === "admin"
                        ? "border-accent bg-accent/10 text-platinum shadow-sm"
                        : "border-glass-border bg-void/50 text-sub hover:border-glass-highlight"
                    }`}
                  >
                    <span className="text-xs font-semibold text-platinum flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                      Administrador
                    </span>
                    <span className="text-[10px] text-sub mt-0.5 leading-tight">
                      Gestão completa e equipe
                    </span>
                  </button>
                </div>
              </div>

              {/* Nome da Empresa */}
              <div className="space-y-1.5">
                <label
                  htmlFor="companyName"
                  className="block font-mono text-[11px] uppercase tracking-wider text-sub"
                >
                  Nome da Empresa / Organização *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-sub" />
                  <input
                    id="companyName"
                    type="text"
                    placeholder="Ex: Gofer Metais"
                    disabled={isSubmitting || Boolean(inviteCompany)}
                    {...register("companyName")}
                    className="h-10 w-full rounded-md border border-glass-border bg-void/80 pl-9 pr-3 text-xs text-platinum placeholder:text-sub focus:border-accent focus:outline-none transition-colors disabled:opacity-70"
                  />
                </div>
                {errors.companyName && (
                  <span className="text-[11px] text-red-400 font-mono">
                    {errors.companyName.message}
                  </span>
                )}
                {inviteCompany && (
                  <span className="text-[10px] text-emerald-400 font-mono">
                    ✓ Vinculado à organização {inviteCompany}
                  </span>
                )}
              </div>

              {/* Nome do Operador */}
              <div className="space-y-1.5">
                <label
                  htmlFor="fullName"
                  className="block font-mono text-[11px] uppercase tracking-wider text-sub"
                >
                  Seu Nome Completo *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-sub" />
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Ex: Lucas Freitas (ou Jorge)"
                    disabled={isSubmitting}
                    {...register("fullName")}
                    className="h-10 w-full rounded-md border border-glass-border bg-void/80 pl-9 pr-3 text-xs text-platinum placeholder:text-sub focus:border-accent focus:outline-none transition-colors disabled:opacity-50"
                  />
                </div>
                {errors.fullName && (
                  <span className="text-[11px] text-red-400 font-mono">
                    {errors.fullName.message}
                  </span>
                )}
              </div>

              {/* E-mail Corporativo */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block font-mono text-[11px] uppercase tracking-wider text-sub"
                >
                  E-mail de Acesso *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-sub" />
                  <input
                    id="email"
                    type="email"
                    placeholder="seu.email@gofermetais.com"
                    autoComplete="email"
                    disabled={isSubmitting}
                    {...register("email")}
                    className="h-10 w-full rounded-md border border-glass-border bg-void/80 pl-9 pr-3 text-xs text-platinum placeholder:text-sub focus:border-accent focus:outline-none transition-colors disabled:opacity-50"
                  />
                </div>
                {errors.email && (
                  <span className="text-[11px] text-red-400 font-mono">
                    {errors.email.message}
                  </span>
                )}
              </div>

              {/* Senha */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block font-mono text-[11px] uppercase tracking-wider text-sub"
                >
                  Chave de Acesso (Senha) *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-sub" />
                  <input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    {...register("password")}
                    className="h-10 w-full rounded-md border border-glass-border bg-void/80 pl-9 pr-3 text-xs text-platinum placeholder:text-sub focus:border-accent focus:outline-none transition-colors disabled:opacity-50"
                  />
                </div>
                {errors.password && (
                  <span className="text-[11px] text-red-400 font-mono">
                    {errors.password.message}
                  </span>
                )}
              </div>

              {/* Destaque do Isolamento de Carteira */}
              <div className="rounded-lg border border-glass-border bg-void/60 p-3 space-y-1 text-[11px] text-sub">
                <div className="flex items-center gap-1.5 text-platinum font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Silo de Carteira & Radar Anti-Colisão</span>
                </div>
                <p>
                  Cada operador da equipe terá seu <strong>próprio Kanban limpo</strong> sem cruzar dados com os demais. O radar notificará apenas se houver leads duplicados.
                </p>
              </div>

              {/* Botão Principal: Ativação Imediata */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-accent px-4 text-xs font-semibold text-void transition-colors hover:bg-accent-hover cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
              >
                {isSubmitting ? (
                  <span className="font-mono text-xs">Criando Conta e Acessando...</span>
                ) : (
                  <>
                    <span>Criar Conta & Acessar Pipeline</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>

              {/* Opção Secundária: Ativar por Chave de E-mail */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={onCodeRequest}
                  className="text-[11px] font-mono text-sub hover:text-platinum transition-colors underline underline-offset-4 cursor-pointer"
                >
                  Prefere receber chave por e-mail? Clique aqui
                </button>
              </div>
            </form>
          ) : (
            /* ETAPA 2: DIGITAÇÃO E VALIDAÇÃO DA CHAVE ENVIADA AO E-MAIL */
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="text-center space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                  <MailCheck className="h-6 w-6" />
                </div>
                <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-platinum">
                  Chave Enviada para seu E-mail
                </h2>
                <p className="text-xs text-sub">
                  Enviamos o código de segurança de 6 dígitos para{" "}
                  <span className="font-semibold text-platinum font-mono">{targetEmail}</span>.
                </p>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-center font-mono text-[11px] uppercase tracking-wider text-sub">
                    Digite a chave de 6 dígitos
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    autoFocus
                    className="h-12 w-full text-center text-2xl font-mono font-bold tracking-[0.5em] rounded-md border border-glass-border bg-void/80 text-platinum focus:border-accent focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifying || verificationCode.length !== 6}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-accent px-4 text-xs font-semibold text-void transition-colors hover:bg-accent-hover cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <span className="font-mono text-xs">Validando Chave...</span>
                  ) : (
                    <>
                      <span>Confirmar Chave e Ativar Conta</span>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Ações Auxiliares: Reenviar e Voltar */}
              <div className="flex items-center justify-between border-t border-glass-border/60 pt-4 text-xs text-sub">
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="flex items-center gap-1 hover:text-platinum transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span>Alterar dados</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0}
                  className="flex items-center gap-1 font-mono text-[11px] text-accent hover:underline cursor-pointer disabled:opacity-50 disabled:no-underline"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>
                    {resendCooldown > 0
                      ? `Reenviar (${resendCooldown}s)`
                      : "Reenviar chave"}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Link para Login */}
          <div className="border-t border-glass-border/70 pt-4 text-center">
            <span className="text-xs text-sub">Já possui uma conta cadastrada? </span>
            <Link
              href="/login"
              className="text-xs font-semibold text-platinum hover:text-accent transition-colors underline-offset-4 hover:underline"
            >
              Fazer Login &rarr;
            </Link>
          </div>
        </div>

        {/* Rodapé */}
        <div className="text-center text-[11px] text-sub font-mono">
          Black Link Ecosystem &copy; {new Date().getFullYear()} &bull; Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-void text-sub font-mono text-xs">Carregando formulário...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
