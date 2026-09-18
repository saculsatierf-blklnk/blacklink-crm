"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { useAuthStore } from "@/store/useAuthStore";

export function LogoutButton() {
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleLogout = async () => {
    clearSession();
    await logoutAction();
  };

  return (
    <button
      onClick={handleLogout}
      title="Encerrar Sessão"
      className="flex h-9 w-9 items-center justify-center rounded-md border border-glass-border bg-carbon text-sub hover:text-platinum hover:border-accent/40 transition-colors cursor-pointer"
    >
      <LogOut className="h-3.5 w-3.5" />
    </button>
  );
}
