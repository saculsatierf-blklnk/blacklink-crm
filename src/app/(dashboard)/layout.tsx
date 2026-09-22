import { cookies } from "next/headers";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

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
    <div className="flex min-h-screen bg-void text-platinum">
      {/* Sidebar Fixa no Desktop com suporte a perfil SSR */}
      <Sidebar initialRole={userRole} />

      {/* Estrutura Principal com Header Superior e Área Dinâmica */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header initialRole={userRole} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
