import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#030303",
        carbon: {
          DEFAULT: "#0A0A0A",
          muted: "#121212",
          border: "#1C1C1C",
        },
        platinum: {
          DEFAULT: "#E5E4E2",
          bright: "#F5F5F3",
        },
        sub: "#71717A",
        accent: {
          DEFAULT: "#FFFFFF",
          hover: "#E5E4E2",
        },
        glass: {
          surface: "rgba(255, 255, 255, 0.02)",
          border: "rgba(255, 255, 255, 0.08)",
          highlight: "rgba(255, 255, 255, 0.15)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
