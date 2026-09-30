import type { Metadata } from "next";
import {
  Space_Grotesk,
  Playfair_Display,
  Plus_Jakarta_Sans,
  Inter,
} from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

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
      <body
        className={`min-h-screen bg-[#050505] text-zinc-200 antialiased font-sans selection:bg-white/30 flex flex-col ${spaceGrotesk.variable} ${playfairDisplay.variable} ${plusJakartaSans.variable} ${inter.variable}`}
      >
        {/* Luzes radiais para refração no vidro Apple Glassmorphism */}
        <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-zinc-800/30 blur-[150px]" />
          <div className="absolute top-[70%] -right-[10%] w-[40%] h-[50%] rounded-full bg-zinc-700/20 blur-[150px]" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
