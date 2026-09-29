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
    <div className="min-h-screen bg-[#050505] text-zinc-200 selection:bg-white/30 font-sans">
      {/* Luzes radiais para efeito de refração no vidro */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-zinc-800/30 blur-[150px]" />
        <div className="absolute top-[70%] -right-[10%] w-[40%] h-[50%] rounded-full bg-zinc-700/20 blur-[150px]" />
      </div>

      {/* Sidebar Flutuante/Translúcida Desktop */}
      <Sidebar initialRole={userRole} />

      <div className="relative z-10 w-full max-w-[1600px] mx-auto md:pl-64 flex flex-col min-h-screen">
        <Header initialRole={userRole} />
        <main className="flex-1 p-8 lg:p-12">
          {children}
        </main>
      </div>

      {/* Tour Guiado Interativo */}
      <GuidedTourModal />
    </div>
  );
}
