"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { loginAction } from "@/actions/auth";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const [serverError, setServerError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

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

  // Login tradicional via E-mail Corporativo e Senha
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

  // Acionamento do Pop-up Oficial do Google OAuth 2.0
  const handleGoogleSignIn = async () => {
    setServerError(null);
    setGoogleLoading(true);

    try {
      // 1. Testa se o endpoint do Google está com as credenciais configuradas
      const checkRes = await fetch("/api/auth/google", { method: "HEAD" });

      if (checkRes.status === 500) {
        setGoogleLoading(false);
        setShowConfigModal(true);
        return;
      }

      // 2. Abre a janela Pop-up oficial do Google
      const width = 500;
      const height = 650;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        "/api/auth/google",
        "google-oauth-popup",
        `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
      );

      if (!popup) {
        // Se houver bloqueador de pop-ups, faz redirecionamento direto
        window.location.href = "/api/auth/google";
        return;
      }

      // 3. Ouve a mensagem de sucesso transmitida pelo pop-up após consentimento no Google
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === "GOOGLE_AUTH_SUCCESS") {
          window.removeEventListener("message", handleMessage);
          if (event.data.user) {
            setUser(event.data.user);
          }
          router.push(event.data.destination || "/");
        } else if (event.data?.type === "GOOGLE_AUTH_ERROR") {
          window.removeEventListener("message", handleMessage);
          setGoogleLoading(false);
          setServerError(event.data.error || "Falha na autenticação com o Google.");
        }
      };

      window.addEventListener("message", handleMessage);
    } catch {
      setGoogleLoading(false);
      setShowConfigModal(true);
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

          {/* Botão Oficial do Google com Abertura de Pop-up Nativo */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="flex h-11 w-full items-center justify-center gap-3 rounded-md border border-glass-border bg-void/90 px-4 text-xs font-semibold text-platinum hover:bg-carbon-muted/80 hover:border-glass-highlight transition-all cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-60"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
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
              <span>{googleLoading ? "Conectando ao Google..." : "Continuar com o Google"}</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-glass-border" />
            <span className="absolute bg-carbon px-2 text-[10px] font-mono text-sub uppercase">
              ou acesse com e-mail e chave
            </span>
          </div>

          {/* Mensagem de Erro Geral */}
          {serverError && (
            <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Formulário Tradicional de Login */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

      {/* Modal Executivo: Ativação do Google OAuth 2.0 Oficial */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-xl border border-glass-border bg-carbon p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-glass-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-platinum">
                  Ativação do Pop-up Oficial Google OAuth
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="text-xs text-sub hover:text-platinum font-mono"
              >
                Fechar
              </button>
            </div>

            <p className="text-xs text-sub leading-relaxed">
              O fluxo oficial de pop-up do Google está 100% implementado no backend do CRM. Para que o Google autorize a exibição da janela oficial em seu domínio (<code className="text-platinum">blacklink-crm.netlify.app</code>), o Google exige as chaves de cliente OAuth 2.0.
            </p>

            <div className="rounded-lg border border-glass-border bg-void/60 p-4 space-y-2 text-xs">
              <span className="font-mono text-accent font-bold block">
                Passos para gerar as chaves no Google Cloud Console:
              </span>
              <ol className="list-decimal pl-4 space-y-1.5 text-sub">
                <li>
                  Acesse:{" "}
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent underline inline-flex items-center gap-1"
                  >
                    console.cloud.google.com/apis/credentials <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>Clique em <strong>Criar Credenciais</strong> &gt; <strong>ID do cliente OAuth</strong>.</li>
                <li>Tipo de aplicativo: <strong>Aplicativo da Web</strong>.</li>
                <li>
                  Origens JavaScript autorizadas:
                  <div className="font-mono text-[10px] text-platinum bg-carbon p-1.5 rounded mt-1">
                    https://blacklink-crm.netlify.app
                  </div>
                </li>
                <li>
                  URIs de redirecionamento autorizados:
                  <div className="font-mono text-[10px] text-platinum bg-carbon p-1.5 rounded mt-1">
                    https://blacklink-crm.netlify.app/api/auth/callback/google
                  </div>
                </li>
                <li>
                  Copie o <strong>ID do cliente</strong> e a <strong>Chave secreta do cliente</strong> e adicione na Netlify:
                  <div className="font-mono text-[10px] text-accent bg-carbon p-1.5 rounded mt-1">
                    GOOGLE_CLIENT_ID="..."<br />
                    GOOGLE_CLIENT_SECRET="..."
                  </div>
                </li>
              </ol>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-sub">
                Você também pode entrar imediatamente com seu e-mail e chave de acesso abaixo.
              </span>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="rounded-md bg-accent px-4 py-2 text-xs font-semibold text-void hover:bg-accent-hover font-mono cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
