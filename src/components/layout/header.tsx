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
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-glass-border bg-carbon/80 px-6 backdrop-blur-md">
        {/* Busca e Contexto Global */}
        <div className="flex items-center gap-4">
          <div data-tour="header-search" className="relative hidden sm:block">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-sub" />
            <input
              type="text"
              placeholder="Buscar registros, leads ou contas..."
              className="h-9 w-64 md:w-80 rounded-md border border-glass-border bg-void/60 pl-9 pr-3 text-xs text-platinum placeholder:text-sub focus:border-accent focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Gestão de Equipe, Tutorial Interativo, Identidade do Operador e Ação de Logout */}
        <div className="flex items-center gap-3">
          {/* Botão de Disparo do Tutorial Interativo */}
          <button
            onClick={() => resetTour()}
            className="flex h-9 items-center gap-1.5 rounded-md border border-glass-border bg-carbon px-2.5 text-xs text-sub hover:text-platinum hover:border-accent/40 transition-colors cursor-pointer"
            title="Iniciar Tutorial Guiado Passo a Passo"
          >
            <Compass className="h-3.5 w-3.5 text-accent" />
            <span className="hidden lg:inline font-mono">Tutorial Guiado</span>
          </button>

          {isAdmin && (
            <button
              data-tour="header-team"
              onClick={() => setIsTeamModalOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-md border border-glass-border bg-carbon px-3 text-xs text-sub hover:text-platinum hover:border-accent/40 transition-colors cursor-pointer"
              title="Gerenciar Equipe e Operadores"
            >
              <Users className="h-3.5 w-3.5 text-accent" />
              <span className="hidden md:inline font-mono">Equipe</span>
            </button>
          )}

          <div className="flex items-center gap-3 border-l border-r border-glass-border px-3 sm:px-4">
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

      {/* Modal de Gestão da Equipe para Administradores */}
      {isAdmin && (
        <TeamManagementModal
          isOpen={isTeamModalOpen}
          onClose={() => setIsTeamModalOpen(false)}
          currentUserId={user?.id}
        />
      )}
    </>
  );
}
