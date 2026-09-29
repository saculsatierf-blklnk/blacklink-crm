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

      {/* Estrutura Principal com Offset da Sidebar Fixa, Header Translúcido e Main Canvas com Respiro Extremo */}
      <div className="flex flex-1 flex-col min-w-0 md:pl-64 min-h-screen">
        <Header initialRole={userRole} />
        <main className="flex-1 p-8 lg:p-12 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Tour Guiado Interativo */}
      <GuidedTourModal />
    </div>
  );
}
