"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight, Lock, Mail, ShieldCheck, Users } from "lucide-react";
import { loginAction } from "@/actions/auth";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<"commercial" | "admin">("commercial");
  const [serverError, setServerError] = useState<string | null>(null);
  const setUser = useAuthStore((state) => state.setUser);

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

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setServerError(null);

      const isCommercial = selectedRole === "commercial";

      // Injeta o estado inicial do operador no Zustand
      setUser({
        id: isCommercial
          ? "u-commercial-hunter-01"
          : "u-9e8a7b6c-5d4e-3f2a-1b0c-9d8e7f6a5b4c",
        company_id: "c-0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
        role: selectedRole,
        name: isCommercial
          ? "Operador Comercial (Hunter)"
          : "Operador Black Link Enterprise",
        email: data.email,
      });

      const result = await loginAction({ ...data, role: selectedRole });

      if (result?.error) {
        setServerError(result.error);
      }
    } catch (err) {
      // O redirect do Next.js lança um erro interno intencional (NEXT_REDIRECT)
      if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
        return;
      }
      setServerError("Falha na autenticação corporativa. Verifique os dados inseridos.");
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-void px-4 text-platinum">
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

        {/* Card do Formulário (Design System: Carbon #0A0A0A + Glass Border) */}
        <div className="rounded-xl border border-glass-border bg-carbon p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between border-b border-glass-border/70 pb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-sub flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-platinum" />
              Ambiente Restrito
            </span>
            <span className="text-[10px] font-mono text-sub">TLS 1.3 / B2B</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Mensagem de Erro Geral */}
            {serverError && (
              <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Seletor de Perfil de Acesso (RBAC) */}
            <div className="space-y-1.5">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-sub">
                Perfil de Acesso
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole("commercial")}
                  disabled={isSubmitting}
                  className={`flex items-center justify-center gap-1.5 rounded-md border p-2.5 text-xs font-mono transition-all cursor-pointer ${
                    selectedRole === "commercial"
                      ? "border-accent bg-carbon-muted text-accent font-semibold shadow-inner"
                      : "border-glass-border bg-void/60 text-sub hover:text-platinum hover:bg-carbon-muted/40"
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Comercial</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("admin")}
                  disabled={isSubmitting}
                  className={`flex items-center justify-center gap-1.5 rounded-md border p-2.5 text-xs font-mono transition-all cursor-pointer ${
                    selectedRole === "admin"
                      ? "border-accent bg-carbon-muted text-accent font-semibold shadow-inner"
                      : "border-glass-border bg-void/60 text-sub hover:text-platinum hover:bg-carbon-muted/40"
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Administrador</span>
                </button>
              </div>
            </div>

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
                  placeholder="operador@blacklink.com.br"
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

            {/* Botão de Submissão (Design System: Accent Branco Puro) */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-accent px-4 text-xs font-semibold text-void transition-colors hover:bg-accent-hover cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
        </div>

        {/* Rodapé do Login */}
        <div className="text-center text-[11px] text-sub font-mono">
          Black Link Ecosystem &copy; {new Date().getFullYear()} &bull; Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
}
