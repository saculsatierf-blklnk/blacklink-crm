"use client";

import { useUiStore } from "@/store/useUiStore";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { GuidedTourModal } from "@/components/tour/GuidedTourModal";

interface DashboardShellProps {
  userRole: "admin" | "commercial";
  children: React.ReactNode;
}

export function DashboardShell({ userRole, children }: DashboardShellProps) {
  const isSidebarCollapsed = useUiStore((state) => state.isSidebarCollapsed);

  return (
    <div className="relative min-h-screen bg-[#050505] text-zinc-100 flex flex-col">
      {/* Sidebar Flutuante / Retrátil */}
      <Sidebar />

      {/* Main Container com Margem Dinâmica para Maximizar o Canvas de Trabalho */}
      <div
        className={`relative z-10 w-full flex flex-col min-h-screen transition-[padding] duration-300 ease-in-out ${
          isSidebarCollapsed ? "md:pl-20" : "md:pl-64"
        }`}
      >
        <Header onOpenNewDealModal={() => {}} />
        <main className="flex-1 p-6 lg:p-10 max-w-[1700px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Tour Guiado Interativo */}
      <GuidedTourModal />
    </div>
  );
}
