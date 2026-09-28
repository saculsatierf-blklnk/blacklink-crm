"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { registerCompanyAdminAction } from "@/actions/auth";
import {
  registerCompanySchema,
  type RegisterCompanyFormValues,
} from "@/lib/validations/auth";
import { useAuthStore } from "@/store/useAuthStore";

export default function RegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [showGoogleNotice, setShowGoogleNotice] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
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

  const onSubmit = async (data: RegisterCompanyFormValues) => {
    try {
      setServerError(null);

      const result = await registerCompanyAdminAction(data);

      if (result?.error) {
        setServerError(result.error);
      } else {
        // Atualiza estado local da sessão
        setUser({
          id: "new-admin",
          company_id: "new-tenant",
          role: "admin",
          name: data.fullName,
          email: data.email,
        });
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
        return;
      }
      setServerError("Erro ao cadastrar a conta corporativa. Tente novamente.");
    }
  };

  const handleGoogleAuth = () => {
    setShowGoogleNotice(true);
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
            Cadastro do primeiro Administrador e inicialização da empresa
          </p>
        </div>

        {/* Card do Formulário */}
        <div className="rounded-xl border border-glass-border bg-carbon p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between border-b border-glass-border/70 pb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-sub flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-platinum" />
              Conta Mestre
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              Administrador
            </span>
          </div>

          {/* Botão Google OAuth */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleGoogleAuth}
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

            {showGoogleNotice && (
              <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-[11px] text-amber-200 leading-relaxed">
                <span className="font-semibold block mb-0.5">Integração Google OAuth:</span>
                O acesso direto com Google é sincronizado com as chaves corporativas no ambiente de produção.
                Para registro imediato agora, conclua com o formulário corporativo abaixo.
              </div>
            )}
          </div>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-glass-border" />
            <span className="absolute bg-carbon px-2 text-[10px] font-mono text-sub uppercase">
              ou preencha os dados
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
                  placeholder="Ex: Black Link Soluções B2B"
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
                  placeholder="Ex: Lucas Leite"
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
                E-mail Corporativo *
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

            {/* Informações sobre Permissões */}
            <div className="rounded-lg border border-glass-border bg-void/60 p-3 space-y-1 text-[11px] text-sub">
              <div className="flex items-center gap-1.5 text-platinum font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                <span>Poderes do Administrador</span>
              </div>
              <p>
                Como primeiro titular, você terá permissão total para gerenciar a equipe,
                adicionar novos administradores ou operadores comerciais.
              </p>
            </div>

            {/* Botão de Submissão */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-accent px-4 text-xs font-semibold text-void transition-colors hover:bg-accent-hover cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="font-mono text-xs">Inicializando Organização...</span>
              ) : (
                <>
                  <span>Criar Conta Corporativa</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

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
