"use client";

import { LogOut, Search, User as UserIcon } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { useAuthStore } from "@/store/useAuthStore";

export function Header() {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleLogout = async () => {
    clearSession();
    await logoutAction();
  };

  const displayName = user?.name || "Operador Black Link Enterprise";
  const displayRole = user?.role || "admin";

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-glass-border bg-carbon/80 px-6 backdrop-blur-md">
      {/* Busca e Contexto Global */}
      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-sub" />
          <input
            type="text"
            placeholder="Buscar registros, leads ou contas..."
            className="h-9 w-64 md:w-80 rounded-md border border-glass-border bg-void/60 pl-9 pr-3 text-xs text-platinum placeholder:text-sub focus:border-accent focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Identidade do Operador (Consumida do Zustand) e Ação de Logout */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 border-r border-glass-border pr-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-glass-border bg-carbon-muted text-platinum">
            <UserIcon className="h-4 w-4 text-sub" />
          </div>
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold text-platinum tracking-tight">
              {displayName}
            </span>
            <span className="text-[10px] font-mono text-sub uppercase">
              Acesso: <span className="text-platinum font-medium">{displayRole}</span>
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Encerrar Sessão"
          className="flex h-9 items-center gap-1.5 rounded-md border border-glass-border bg-carbon px-3 text-xs text-sub hover:text-platinum hover:border-accent/40 transition-colors cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline font-mono">Sair</span>
        </button>
      </div>
    </header>
  );
}
