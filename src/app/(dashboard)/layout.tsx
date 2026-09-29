import { cookies } from "next/headers";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { GuidedTourModal } from "@/components/tour/GuidedTourModal";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("blacklink_session")?.value;
  let userRole: "admin" | "commercial" = "admin";

  if (sessionToken) {
    try {
      const decoded = JSON.parse(
        Buffer.from(sessionToken, "base64url").toString("utf-8")
      );
      if (decoded.role === "commercial") {
        userRole = "commercial";
      }
    } catch {}
  }

  return (
    <div className="flex min-h-screen bg-black text-zinc-100 selection:bg-white selection:text-black">
      {/* Sidebar Flutuante/Translúcida Desktop */}
      <Sidebar initialRole={userRole} />

      {/* Estrutura Principal com Header Superior Translúcido e Área de Conteúdo Respirada */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header initialRole={userRole} />
        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto space-y-10">
          {children}
        </main>
      </div>

      {/* Tour Guiado Interativo */}
      <GuidedTourModal />
    </div>
  );
}
