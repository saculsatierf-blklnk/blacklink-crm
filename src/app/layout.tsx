import type { Metadata } from "next";
import {
  // 1-4: Fontes originais
  Space_Grotesk,
  Playfair_Display,
  Plus_Jakarta_Sans,
  Inter,
  // 5-8: Tech / Código
  Fira_Code,
  JetBrains_Mono,
  IBM_Plex_Mono,
  Roboto_Mono,
  // 9-15: SaaS / Modernas
  Syne,
  DM_Sans,
  Montserrat,
  Poppins,
  Outfit,
  Bebas_Neue,
  Oswald,
  // 16-20: Editorial / Luxo
  Merriweather,
  Lora,
  EB_Garamond,
  Cinzel,
  Crimson_Pro,
} from "next/font/google";
import "./globals.css";

// 1-4: Originais
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

// 5-8: Tech / Código
const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
});

// 9-15: SaaS / Modernas
const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas-neue",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});

// 16-20: Editorial / Luxo
const merriweather = Merriweather({
  subsets: ["latin"],
  variable: "--font-merriweather",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  variable: "--font-crimson-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Black Link CRM | Enterprise Data & Conversion Platform",
  description: "Plataforma corporativa de alta precisão para inteligência de dados, gestão e conversão B2B.",
};

const fontVariables = [
  spaceGrotesk.variable,
  playfairDisplay.variable,
  plusJakartaSans.variable,
  inter.variable,
  firaCode.variable,
  jetbrainsMono.variable,
  ibmPlexMono.variable,
  robotoMono.variable,
  syne.variable,
  dmSans.variable,
  montserrat.variable,
  poppins.variable,
  outfit.variable,
  bebasNeue.variable,
  oswald.variable,
  merriweather.variable,
  lora.variable,
  ebGaramond.variable,
  cinzel.variable,
  crimsonPro.variable,
].join(" ");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark scroll-smooth">
      <body
        className={`min-h-screen bg-[#050505] text-zinc-200 antialiased font-sans selection:bg-white/30 flex flex-col ${fontVariables}`}
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
