"use client";

import { useState } from "react";
import { Compass, LogOut, Search, User as UserIcon, Users } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { useTourStore } from "@/store/useTourStore";
import { TeamManagementModal } from "@/components/team/TeamManagementModal";

interface HeaderProps {
  initialRole?: "admin" | "commercial";
}

export function Header({ initialRole }: HeaderProps) {
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const resetTour = useTourStore((state) => state.resetTour);

  const handleLogout = async () => {
    clearSession();
    await logoutAction();
  };

  const currentRole = user?.role || initialRole || "admin";
  const isAdmin = currentRole === "admin";

  const displayName =
    user?.name ||
    (currentRole === "commercial"
      ? "Operador Comercial"
      : "Administrador");

  const roleLabelMap: Record<string, string> = {
    admin: "Administrador",
    commercial: "Comercial",
  };
  const displayRole = roleLabelMap[currentRole] || "Comercial";

  return (
    <>
      <header className="sticky top-0 z-40 flex h-18 w-full items-center justify-between border-b border-white/10 bg-black/40 px-6 sm:px-8 backdrop-blur-2xl transition-all">
        {/* Busca e Contexto Global */}
        <div className="flex items-center gap-4">
          <div data-tour="header-search" className="relative hidden sm:block">
            <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar registros, leads ou contas..."
              className="h-9.5 w-64 md:w-80 rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-4 text-xs text-white placeholder:text-zinc-500 focus:bg-white/[0.08] focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-300"
            />
          </div>
        </div>

        {/* Gestão de Equipe, Tutorial Interativo, Identidade do Operador e Ação de Logout */}
        <div className="flex items-center gap-3">
          {/* Botão de Disparo do Tutorial Interativo */}
          <button
            onClick={() => resetTour()}
            className="flex h-9.5 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-xs text-zinc-300 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 cursor-pointer shadow-sm"
            title="Iniciar Tutorial Guiado Passo a Passo"
          >
            <Compass className="h-3.5 w-3.5 text-white" />
            <span className="hidden lg:inline font-medium tracking-tight">Tutorial Guiado</span>
          </button>

          {isAdmin && (
            <button
              data-tour="header-team"
              onClick={() => setIsTeamModalOpen(true)}
              className="flex h-9.5 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-xs text-zinc-300 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 cursor-pointer shadow-sm"
              title="Gerenciar Equipe e Operadores"
            >
              <Users className="h-3.5 w-3.5 text-white" />
              <span className="hidden md:inline font-medium tracking-tight">Equipe</span>
            </button>
          )}

          <div className="flex items-center gap-3 border-l border-r border-white/10 px-4">
            <div className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white shadow-inner">
              <UserIcon className="h-4 w-4 text-zinc-300" />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-xs font-semibold text-white tracking-tight">
                {displayName}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                Acesso: <span className="text-white font-medium">{displayRole}</span>
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Encerrar Sessão"
            className="flex h-9.5 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-xs text-zinc-300 hover:text-white hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300 cursor-pointer shadow-sm"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline font-medium tracking-tight">Sair</span>
          </button>
        </div>
      </header>

      {/* Modal de Gestão de Equipe */}
      {isTeamModalOpen && (
        <TeamManagementModal
          isOpen={isTeamModalOpen}
          onClose={() => setIsTeamModalOpen(false)}
        />
      )}
    </>
  );
}
