import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Black Link CRM | Enterprise Data & Conversion Platform",
  description: "Plataforma corporativa de alta precisão para inteligência de dados, gestão e conversão B2B.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark scroll-smooth">
      <body className="min-h-screen bg-black text-zinc-100 font-sans antialiased flex flex-col selection:bg-white selection:text-black">
        {/* Camada de Iluminação Ambiente Sutil Apple Dark */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-white/[0.04] to-transparent rounded-full blur-3xl opacity-70" />
          <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-b from-indigo-500/[0.02] to-transparent rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
