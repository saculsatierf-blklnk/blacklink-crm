import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Base Noir Corporativo Black Link
        void: "#030303",
        carbon: "#0A0A0A",
        surface: {
          DEFAULT: "#121212",
          elevated: "#18181B",
          hover: "#222226",
        },
        // Acentos e Metálicos
        platinum: "#E5E4E2",
        gold: {
          DEFAULT: "#C5A059",
          muted: "rgba(197, 160, 89, 0.15)",
          glow: "rgba(197, 160, 89, 0.4)",
        },
        // Textos de Alta Fidelidade
        foreground: "#F4F4F5",
        muted: "#71717A",
        subtle: "#A1A1AA",
        // Status de Deals & Pipelines B2B
        status: {
          prospecting: "#3B82F6",
          qualification: "#F59E0B",
          proposal: "#8B5CF6",
          negotiation: "#C5A059",
          won: "#10B981",
          lost: "#EF4444",
        },
        // Bordas e Vidro Escuro
        border: {
          hairline: "rgba(255, 255, 255, 0.08)",
          subtle: "rgba(255, 255, 255, 0.12)",
          focus: "rgba(255, 255, 255, 0.25)",
        },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "Manrope", "sans-serif"],
        mono: ["var(--font-geist-mono)", "SF Mono", "monospace"],
      },
      boxShadow: {
        "panel-glow": "0 0 25px -5px rgba(0, 0, 0, 0.8)",
        "gold-glow": "0 0 30px -5px rgba(197, 160, 89, 0.25)",
      },
      letterSpacing: {
        tightest: "-0.03em",
        widest: "0.2em",
      },
    },
  },
  plugins: [],
};

export default config;
