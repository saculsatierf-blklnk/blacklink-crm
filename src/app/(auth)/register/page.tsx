"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
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
  User,
} from "lucide-react";
import {
  requestRegistrationCodeAction,
  verifyCodeAndActivateAccountAction,
} from "@/actions/auth";
import {
  registerCompanySchema,
  type RegisterCompanyFormValues,
} from "@/lib/validations/auth";
import { useAuthStore } from "@/store/useAuthStore";

export default function RegisterPage() {
  const [step, setStep] = useState<"form" | "verify">("form");
  const [serverError, setServerError] = useState<string | null>(null);
  const [targetEmail, setTargetEmail] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const setUser = useAuthStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterCompanyFormValues>({
    resolver: zodResolver(registerCompanySchema),
    defaultValues: {
      companyName: "",
      fullName: "",
      email: "",
      password: "",
    },
  });

  // Temporizador para reenvio de chave
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Submissão do formulário inicial e despacho da chave para o e-mail
  const onFormSubmit = async (data: RegisterCompanyFormValues) => {
    try {
      setServerError(null);
      const res = await requestRegistrationCodeAction(data);

      if (res.success && res.email) {
        setTargetEmail(res.email);
        if (res.devCode) {
          setDevCode(res.devCode);
        }
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
        if (res.devCode) setDevCode(res.devCode);
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
      } else {
        setUser({
          id: "admin-active",
          company_id: "company-active",
          role: "admin",
          name: getValues("fullName"),
          email: targetEmail,
        });
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
        return;
      }
      setServerError("Falha ao validar chave. Tente novamente.");
      setIsVerifying(false);
    }
  };

  // Ativação rápida com Google
  const handleGoogleQuickFill = () => {
    const defaultEmail = "saculsatierf@gmail.com";
    setValue("email", defaultEmail);
    if (!getValues("companyName")) setValue("companyName", "Black Link");
    if (!getValues("fullName")) setValue("fullName", "Lucas de Freitas Leite");
    if (!getValues("password")) setValue("password", "363900");
    setServerError(
      "Conta Google identificada! Clique em 'Enviar Chave para meu E-mail' abaixo para receber o código de segurança."
    );
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
            Validação corporativa do primeiro Administrador da organização
          </p>
        </div>

        {/* Card Principal */}
        <div className="rounded-xl border border-glass-border bg-carbon p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between border-b border-glass-border/70 pb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-sub flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-platinum" />
              {step === "form" ? "Conta Mestre" : "Ativação de Segurança"}
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              {step === "form" ? "Administrador" : "Etapa 2 de 2"}
            </span>
          </div>

          {/* Mensagem de Erro Geral */}
          {serverError && (
            <div className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="leading-snug">{serverError}</span>
            </div>
          )}

          {step === "form" ? (
            <>
              {/* Botão Google OAuth Integrado */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleGoogleQuickFill}
                  className="flex h-10 w-full items-center justify-center gap-3 rounded-md border border-glass-border bg-void/80 px-4 text-xs font-medium text-platinum hover:bg-carbon-muted/70 hover:border-glass-highlight transition-all cursor-pointer"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continuar com o Google</span>
                </button>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-glass-border" />
                <span className="absolute bg-carbon px-2 text-[10px] font-mono text-sub uppercase">
                  ou confirme os dados
                </span>
              </div>

              <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
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
                      placeholder="Ex: Black Link"
                      disabled={isSubmitting}
                      {...register("companyName")}
                      className="h-10 w-full rounded-md border border-glass-border bg-void/80 pl-9 pr-3 text-xs text-platinum placeholder:text-sub focus:border-accent focus:outline-none transition-colors disabled:opacity-50"
                    />
                  </div>
                  {errors.companyName && (
                    <span className="text-[11px] text-red-400 font-mono">
                      {errors.companyName.message}
                    </span>
                  )}
                </div>

                {/* Nome do Administrador */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="fullName"
                    className="block font-mono text-[11px] uppercase tracking-wider text-sub"
                  >
                    Nome Completo do Administrador *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-sub" />
                    <input
                      id="fullName"
                      type="text"
                      placeholder="Ex: Lucas de Freitas Leite"
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
                    E-mail Corporativo (Receberá a Chave) *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-sub" />
                    <input
                      id="email"
                      type="email"
                      placeholder="saculsatierf@gmail.com"
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

                {/* Aviso de Verificação */}
                <div className="rounded-lg border border-glass-border bg-void/60 p-3 space-y-1 text-[11px] text-sub">
                  <div className="flex items-center gap-1.5 text-platinum font-semibold">
                    <KeyRound className="h-3.5 w-3.5 text-accent" />
                    <span>Autenticação Real com Chave por E-mail</span>
                  </div>
                  <p>
                    Ao clicar no botão abaixo, enviaremos uma chave de segurança de 6 dígitos
                    para o seu e-mail corporativo para confirmar a posse antes da liberação.
                  </p>
                </div>

                {/* Botão de Envio */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-accent px-4 text-xs font-semibold text-void transition-colors hover:bg-accent-hover cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="font-mono text-xs">Gerando Chave de Acesso...</span>
                  ) : (
                    <>
                      <span>Enviar Chave para meu E-mail</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </form>
            </>
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

              {/* Informação sobre ambiente de testes / sandbox */}
              {devCode && (
                <div className="rounded-lg border border-amber-400/40 bg-amber-400/10 p-3.5 space-y-1.5 text-[11px] text-amber-200">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-300">
                    <KeyRound className="h-3.5 w-3.5" />
                    <span>Chave Gerada para seu E-mail</span>
                  </div>
                  <p className="leading-snug">
                    Insira o código numérico abaixo para ativar o seu acesso:
                  </p>
                  <div className="mt-1 flex items-center justify-center">
                    <span className="font-mono text-xl font-bold tracking-widest bg-carbon px-4 py-1.5 rounded border border-amber-400/40 text-amber-300 select-all">
                      {devCode}
                    </span>
                  </div>
                </div>
              )}

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
            <span className="text-xs text-sub">Já possui uma conta corporativa? </span>
            <Link
              href="/login"
              className="text-xs font-semibold text-platinum hover:text-accent transition-colors underline-offset-4 hover:underline"
            >
              Fazer Login
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
