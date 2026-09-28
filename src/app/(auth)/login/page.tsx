"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  loginAction,
  requestGoogleLoginCodeAction,
  verifyGoogleLoginCodeAction,
} from "@/actions/auth";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  // Estados do Login Tradicional
  const [serverError, setServerError] = useState<string | null>(null);

  // Estados do Acesso Rápido Google
  const [googleMode, setGoogleMode] = useState<"idle" | "request" | "verify">("idle");
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleCode, setGoogleCode] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Login tradicional via E-mail + Senha
  const onSubmit = async (data: LoginFormValues) => {
    try {
      setServerError(null);
      const result = await loginAction(data);

      if (result?.error) {
        setServerError(result.error);
        return;
      }

      if (result?.user) {
        setUser({
          id: result.user.id,
          company_id: result.user.company_id,
          role: result.user.role,
          name: result.user.name,
          email: result.user.email,
        });

        router.push(result.destination || "/");
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
        return;
      }
      setServerError("Falha na autenticação corporativa. Verifique os dados inseridos.");
    }
  };

  // 1. Iniciar fluxo de envio de chave Google
  const handleRequestGoogleCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = googleEmail.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setGoogleError("Por favor, digite um e-mail válido.");
      return;
    }

    try {
      setGoogleLoading(true);
      setGoogleError(null);

      const res = await requestGoogleLoginCodeAction(cleanEmail);

      if (!res.success) {
        setGoogleError(res.error || "Não foi possível enviar a chave para o e-mail informado.");
        return;
      }

      setGoogleMode("verify");
    } catch {
      setGoogleError("Falha na comunicação com o servidor de envio. Tente novamente.");
    } finally {
      setGoogleLoading(false);
    }
  };

  // 2. Validar chave de 6 dígitos Google e entrar no CRM
  const handleVerifyGoogleCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = googleCode.trim();

    if (cleanCode.length !== 6) {
      setGoogleError("Digite o código de verificação de 6 dígitos.");
      return;
    }

    try {
      setGoogleLoading(true);
      setGoogleError(null);

      const res = await verifyGoogleLoginCodeAction({
        email: googleEmail.trim().toLowerCase(),
        code: cleanCode,
      });

      if (!res.success) {
        setGoogleError(res.error || "Chave incorreta ou expirada.");
        return;
      }

      if (res.user) {
        setUser({
          id: res.user.id,
          company_id: res.user.company_id,
          role: res.user.role,
          name: res.user.name,
          email: res.user.email,
        });

        router.push(res.destination || "/");
      }
    } catch {
      setGoogleError("Erro ao validar acesso. Tente novamente.");
    } finally {
      setGoogleLoading(false);
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
            Autenticação executiva para acesso ao painel de inteligência e dados
          </p>
        </div>

        {/* Card do Formulário */}
        <div className="rounded-xl border border-glass-border bg-carbon p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between border-b border-glass-border/70 pb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-sub flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-platinum" />
              Ambiente Restrito
            </span>
            <span className="text-[10px] font-mono text-sub">TLS 1.3 / B2B</span>
          </div>

          {/* FLUXO GOOGLE: MODO DE SOLICITAÇÃO DE CHAVE */}
          {googleMode === "request" && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
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
                  <span className="text-xs font-mono font-bold text-platinum uppercase tracking-wider">
                    Acesso Direto com Google
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setGoogleMode("idle");
                    setGoogleError(null);
                  }}
                  className="text-xs text-sub hover:text-platinum font-mono"
                >
                  Cancelar
                </button>
              </div>

              <p className="text-xs text-sub leading-relaxed">
                Informe o seu e-mail do Google para enviarmos sua chave de acesso corporativo instantânea:
              </p>

              {googleError && (
                <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{googleError}</span>
                </div>
              )}

              <form onSubmit={handleRequestGoogleCode} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-sub" />
                  <input
                    type="email"
                    autoFocus
                    placeholder="seu-email@gmail.com"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    disabled={googleLoading}
                    className="h-10 w-full rounded-md border border-glass-border bg-void/80 pl-9 pr-3 text-xs text-platinum placeholder:text-sub focus:border-accent focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={googleLoading}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-accent px-4 text-xs font-semibold text-void transition-colors hover:bg-accent-hover cursor-pointer disabled:opacity-60"
                >
                  {googleLoading ? (
                    <span className="font-mono text-xs">Despachando Chave ao Gmail...</span>
                  ) : (
                    <>
                      <span>Enviar Chave para meu Gmail</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* FLUXO GOOGLE: MODO DE VALIDAÇÃO DO CÓDIGO DE 6 DÍGITOS */}
          {googleMode === "verify" && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <span className="text-xs font-mono font-bold text-platinum uppercase tracking-wider">
                    Chave Enviada
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setGoogleMode("request");
                    setGoogleError(null);
                  }}
                  className="text-xs text-sub hover:text-platinum font-mono flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span>Alterar e-mail</span>
                </button>
              </div>

              <div className="rounded-lg border border-glass-border bg-void/60 p-3 space-y-1">
                <p className="text-xs text-platinum">
                  Chave disparada via TLS para:
                </p>
                <p className="font-mono text-xs text-accent font-bold">
                  {googleEmail}
                </p>
                <p className="text-[11px] text-sub">
                  Consulte sua caixa de entrada e digite os 6 dígitos abaixo.
                </p>
              </div>

              {googleError && (
                <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{googleError}</span>
                </div>
              )}

              <form onSubmit={handleVerifyGoogleCode} className="space-y-3">
                <input
                  type="text"
                  autoFocus
                  maxLength={6}
                  placeholder="000000"
                  value={googleCode}
                  onChange={(e) => setGoogleCode(e.target.value.replace(/\D/g, ""))}
                  disabled={googleLoading}
                  className="h-12 w-full rounded-md border border-glass-border bg-void/80 text-center font-mono text-2xl font-bold tracking-[0.4em] text-platinum placeholder:text-sub/40 focus:border-accent focus:outline-none transition-colors"
                />

                <button
                  type="submit"
                  disabled={googleLoading || googleCode.length !== 6}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-accent px-4 text-xs font-semibold text-void transition-colors hover:bg-accent-hover cursor-pointer disabled:opacity-60"
                >
                  {googleLoading ? (
                    <span className="font-mono text-xs">Validando Acesso...</span>
                  ) : (
                    <>
                      <span>Entrar no Painel Corporativo</span>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* FLUXO PADRÃO QUANDO GOOGLE NÃO ESTÁ ATIVO */}
          {googleMode === "idle" && (
            <>
              {/* Botão Google que ativa o acesso direto */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setGoogleEmail("saculsatierf@gmail.com");
                    setGoogleMode("request");
                  }}
                  className="flex h-10 w-full items-center justify-center gap-3 rounded-md border border-glass-border bg-void/80 px-4 text-xs font-medium text-platinum hover:bg-carbon-muted/70 hover:border-glass-highlight transition-all cursor-pointer shadow-sm active:scale-[0.99]"
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
                  <span className="font-semibold">Continuar com o Google</span>
                </button>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-glass-border" />
                <span className="absolute bg-carbon px-2 text-[10px] font-mono text-sub uppercase">
                  ou acesse com e-mail corporativo
                </span>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Mensagem de Erro Geral */}
                {serverError && (
                  <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{serverError}</span>
                  </div>
                )}

                {/* Campo E-mail */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block font-mono text-[11px] uppercase tracking-wider text-sub"
                  >
                    E-mail Corporativo
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-sub" />
                    <input
                      id="email"
                      type="email"
                      placeholder="seu.email@empresa.com"
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

                {/* Campo Senha */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="block font-mono text-[11px] uppercase tracking-wider text-sub"
                  >
                    Chave de Acesso
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-sub" />
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••••••"
                      autoComplete="current-password"
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

                {/* Botão de Submissão */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-accent px-4 text-xs font-semibold text-void transition-colors hover:bg-accent-hover cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
                >
                  {isSubmitting ? (
                    <span className="font-mono text-xs">Validando Credenciais...</span>
                  ) : (
                    <>
                      <span>Acessar Painel Corporativo</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Link para Cadastro */}
          <div className="border-t border-glass-border/70 pt-4 text-center">
            <span className="text-xs text-sub">Primeiro acesso na plataforma? </span>
            <Link
              href="/register"
              className="text-xs font-semibold text-platinum hover:text-accent transition-colors underline-offset-4 hover:underline"
            >
              Cadastre sua Empresa &rarr;
            </Link>
          </div>
        </div>

        {/* Rodapé do Login */}
        <div className="text-center text-[11px] text-sub font-mono">
          Black Link Ecosystem &copy; {new Date().getFullYear()} &bull; Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
}
