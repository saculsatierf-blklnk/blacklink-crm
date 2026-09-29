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
    <div className="relative min-h-screen">
      {/* Sidebar Flutuante/Translúcida Desktop */}
      <Sidebar initialRole={userRole} />

      {/* Main Canvas de Trabalho com Margens e Paddings Maciços */}
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
