import React from "react";
import { LayoutProps, BlackLinkStyleVariant } from "./layoutTypes";

/**
 * Função de Destilação Editorial de Alto Luxo:
 * Converte qualquer texto (mesmo perguntas longas geradas por IA)
 * nos termos conceituais concisos de 1 a 3 palavras das referências da Arina TVA / Design Atum.
 */
function distillHeadline(rawText: string, variant: BlackLinkStyleVariant): string {
  const text = (rawText || "").replace(/["'”]/g, "").trim();

  // Se o usuário digitou um título customizado curto (até 4 palavras e até 28 caracteres), preserva
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length > 0 && words.length <= 4 && text.length <= 28) {
    // Se for 2 a 3 palavras, divide em até 2 linhas para manter o ritmo
    if (words.length >= 3 && variant !== "swiss-box" && variant !== "clean-ice-box") {
      const mid = Math.ceil(words.length / 2);
      return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")].join("\n").toUpperCase();
    }
    return text.toUpperCase();
  }

  // Mapeamentos oficiais por variante idênticos ao padrão Arina TVA / Design Atum
  switch (variant) {
    case "swiss-box":
      return "ESTRATÉGIA B2B";

    case "3d-keycap":
      return "ARQUITETURA DE\nREPUTAÇÃO";

    case "3d-crystal":
      return "SISTEMA DE\nMARCA";

    case "pure-monumental":
      return "ZERO ATRITO.\nMÁXIMA CONVERSÃO.";

    case "3d-cursor":
      return "BLACK LINK OS";

    case "3d-liquid":
      return "TELEMETRIA EM\nTEMPO REAL";

    case "clean-ice-box":
      return "CASES & NÚMEROS";

    case "3d-sculpture":
      return "QUALIFICAÇÃO DE\nALTO TICKET";

    case "clean-ice":
      return "DOSSIÊ EXECUTIVO\nDE ESCALA";

    default:
      return "BLACK LINK OS";
  }
}

/**
 * Template Antigravity — Black Link (1.0)
 * Pôster Editorial Suíço Brutalista de Alta Moda / Branding Internacional
 * Inspirado fielmente nas coleções de referências:
 * - @ARINA_TVA | IG @DESIGN_ATUM (Objetos 3D Octane, Bounding boxes técnicas com handles, setas ↗)
 * - @kunsllu • design (Grades modulares, ritmo de contraste claro/escuro)
 */
export function BlackLinkGlassLayout({
  slide,
  config,
  scale = 1.0,
  currentSlide = 1,
  totalSlides = 1,
}: LayoutProps) {
  // Determina a variação rítmica do post
  const variant: BlackLinkStyleVariant =
    slide.blackLinkVariant || config.blackLinkVariant || "3d-cursor";

  // Conteúdo destilado
  const rawHeadline = (slide.headline || "").trim();
  const displayHeadline = distillHeadline(rawHeadline, variant);

  // Proporções
  const is916 = config.aspectRatio === "9:16";
  const is45 = config.aspectRatio === "4:5";

  // Checa se o fundo é claro (Ice)
  const isLightBackground =
    variant === "3d-crystal" ||
    variant === "clean-ice-box" ||
    variant === "clean-ice";

  // Imagens de fundo oficiais para as variações 3D
  const bgImageSrc = (() => {
    switch (variant) {
      case "3d-cursor":
        return "/brand/blacklink-3d-cursor.jpg";
      case "3d-keycap":
        return "/brand/blacklink-3d-keycap.jpg";
      case "3d-crystal":
        return "/brand/blacklink-3d-crystal.jpg";
      case "3d-liquid":
        return "/brand/blacklink-3d-liquid.jpg";
      case "3d-sculpture":
        return is916 ? "/brand/blacklink-bg-story.jpg" : "/brand/blacklink-bg-square.jpg";
      default:
        return null;
    }
  })();

  // Renderizador de Destaque (**negrito**)
  const renderHighlight = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const clean = part.slice(2, -2);
        return (
          <span
            key={index}
            className={`font-black underline underline-offset-[10px] inline ${
              !isLightBackground
                ? "text-white decoration-white/50 drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]"
                : "text-black decoration-black/40"
            }`}
          >
            {clean}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div
      className={`relative w-full h-full flex flex-col justify-between overflow-hidden select-none transition-colors duration-300 font-sans ${
        isLightBackground ? "bg-[#ECECEC] text-[#09090B]" : "bg-[#030305] text-white"
      }`}
      style={{ width: "1080px", height: is916 ? "1920px" : is45 ? "1350px" : "1080px" }}
    >
      {/* ================================================================== */}
      {/* 1. CAMADA DE FUNDO / IMAGEM 3D                                     */}
      {/* ================================================================== */}
      {bgImageSrc && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div
            className="w-full h-full bg-cover bg-center transition-all duration-700"
            style={{
              backgroundImage: `url('${bgImageSrc}')`,
              filter:
                variant === "3d-crystal"
                  ? "contrast(104%) brightness(99%)"
                  : "contrast(112%) brightness(96%)",
            }}
          />
          {/* Vinheta atmosférica suave apenas para posts escuros com 3D */}
          {!isLightBackground && (
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, rgba(3, 3, 5, 0.05) 0%, rgba(2, 2, 4, 0.45) 70%, rgba(1, 1, 2, 0.8) 100%)",
              }}
            />
          )}
        </div>
      )}

      {/* Margens Guias Sutis de Precisão Suíça (60px) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          className={`absolute top-0 bottom-0 left-[60px] w-px ${
            isLightBackground ? "bg-black/[0.04]" : "bg-white/[0.04]"
          }`}
        />
        <div
          className={`absolute top-0 bottom-0 right-[60px] w-px ${
            isLightBackground ? "bg-black/[0.04]" : "bg-white/[0.04]"
          }`}
        />
      </div>

      {/* ================================================================== */}
      {/* 2. CABEÇALHO EDITORIAL SUÍÇO (DESIGN.BLACKLINK // 2026)            */}
      {/* ================================================================== */}
      <header
        className={`relative z-10 w-full px-[60px] flex items-center justify-between text-xs font-mono tracking-[0.25em] ${
          isLightBackground ? "text-black/50" : "text-white/50"
        } ${is916 ? "pt-24" : is45 ? "pt-16" : "pt-12"}`}
      >
        <span className="font-bold uppercase tracking-[0.28em] text-[12px]">
          DESIGN.BLACKLINK
        </span>

        <span className="font-bold tracking-widest text-[12px]">
          2026
        </span>
      </header>

      {/* ================================================================== */}
      {/* 3. NÚCLEO EDITORIAL CONFORME A VARIAÇÃO VISUAL                     */}
      {/* ================================================================== */}

      {/* ------------------------------------------------------------------ */}
      {/* VARIAÇÃO A: SWISS BOX & CLEAN ICE BOX (BOUNDING BOX COM 8 HANDLES) */}
      {/* Exatamente como 'СТРАТЕГИИ' e 'КЕЙСЫ' na referência da Arina TVA   */}
      {/* ------------------------------------------------------------------ */}
      {(variant === "swiss-box" || variant === "clean-ice-box") && (
        <main className="relative z-10 w-full px-[60px] my-auto flex flex-col justify-center items-center text-center">
          <div className="relative inline-block px-12 py-5 max-w-[820px]">
            {/* Contorno fino */}
            <div
              className={`absolute inset-0 border ${
                variant === "clean-ice-box"
                  ? "border-black/60 bg-black/[0.02]"
                  : "border-white/50 backdrop-blur-[2px] bg-white/[0.03]"
              }`}
            />
            {/* 4 Handles nos 4 cantos */}
            <span
              className={`absolute -top-1 -left-1 w-2.5 h-2.5 ${
                variant === "clean-ice-box" ? "bg-black border border-white" : "bg-white border border-black"
              }`}
            />
            <span
              className={`absolute -top-1 -right-1 w-2.5 h-2.5 ${
                variant === "clean-ice-box" ? "bg-black border border-white" : "bg-white border border-black"
              }`}
            />
            <span
              className={`absolute -bottom-1 -left-1 w-2.5 h-2.5 ${
                variant === "clean-ice-box" ? "bg-black border border-white" : "bg-white border border-black"
              }`}
            />
            <span
              className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 ${
                variant === "clean-ice-box" ? "bg-black border border-white" : "bg-white border border-black"
              }`}
            />
            {/* 4 Handles no centro de cada aresta */}
            <span
              className={`absolute top-1/2 -left-1 -translate-y-1/2 w-2.5 h-2.5 ${
                variant === "clean-ice-box" ? "bg-black border border-white" : "bg-white border border-black"
              }`}
            />
            <span
              className={`absolute top-1/2 -right-1 -translate-y-1/2 w-2.5 h-2.5 ${
                variant === "clean-ice-box" ? "bg-black border border-white" : "bg-white border border-black"
              }`}
            />
            <span
              className={`absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 ${
                variant === "clean-ice-box" ? "bg-black border border-white" : "bg-white border border-black"
              }`}
            />
            <span
              className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 ${
                variant === "clean-ice-box" ? "bg-black border border-white" : "bg-white border border-black"
              }`}
            />

            {/* Termo Principal dentro da Bounding Box */}
            <h1
              className={`relative z-10 font-clash font-bold uppercase tracking-[0.22em] text-2xl md:text-3xl whitespace-nowrap leading-none py-1 ${
                variant === "clean-ice-box" ? "text-black" : "text-white"
              }`}
            >
              {displayHeadline}
            </h1>
          </div>
        </main>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* VARIAÇÃO B: OBJETOS 3D (3D CURSOR, 3D KEYCAP, 3D CRYSTAL, 3D SCULPTURE) */}
      {/* Título editorial compacto no canto superior esquerdo com respiro total */}
      {/* ------------------------------------------------------------------ */}
      {(variant === "3d-cursor" ||
        variant === "3d-keycap" ||
        variant === "3d-crystal" ||
        variant === "3d-sculpture") && (
        <main className="relative z-10 w-full px-[60px] mt-2 mb-auto flex flex-col justify-start items-start text-left">
          <div className="max-w-[440px]">
            <h1
              className={`font-clash font-extrabold uppercase leading-[1.12] whitespace-pre-line tracking-tight ${
                isLightBackground
                  ? "text-black"
                  : "text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]"
              }`}
              style={{
                fontSize: "34px",
                letterSpacing: "-0.02em",
              }}
            >
              {renderHighlight(displayHeadline)}
              <span className="text-xl align-super ml-1 opacity-70">©</span>
            </h1>
          </div>
        </main>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* VARIAÇÃO C: 3D LIQUID (TÍTULO NO CANTO INFERIOR ESQUERDO)          */}
      {/* ------------------------------------------------------------------ */}
      {variant === "3d-liquid" && (
        <main className="relative z-10 w-full px-[60px] mt-auto mb-4 flex flex-col justify-end items-start text-left">
          <div className="max-w-[460px]">
            <h1
              className="font-clash font-extrabold uppercase leading-[1.12] text-white whitespace-pre-line tracking-tight drop-shadow-[0_4px_28px_rgba(0,0,0,0.95)]"
              style={{
                fontSize: "34px",
                letterSpacing: "-0.02em",
              }}
            >
              {renderHighlight(displayHeadline)}
              <span className="text-xl align-super ml-1 opacity-70">©</span>
            </h1>
          </div>
        </main>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* VARIAÇÃO D: PURE MONUMENTAL & CLEAN ICE (TIPOGRAFIA CENTRAL PURA)   */}
      {/* ------------------------------------------------------------------ */}
      {(variant === "pure-monumental" || variant === "clean-ice") && (
        <main className="relative z-10 w-full px-[60px] my-auto flex flex-col justify-center items-start text-left">
          <div className="max-w-[760px] space-y-5">
            <h1
              className={`font-clash font-black tracking-tight uppercase leading-[1.06] whitespace-pre-line ${
                isLightBackground ? "text-black" : "text-white"
              }`}
              style={{
                fontSize: "46px",
                letterSpacing: "-0.03em",
              }}
            >
              {renderHighlight(displayHeadline)}
            </h1>

            {/* Linha Divisória de Precisão */}
            <div
              className={`w-16 h-[1.5px] ${
                isLightBackground ? "bg-black/35" : "bg-white/35"
              }`}
            />
          </div>
        </main>
      )}

      {/* ================================================================== */}
      {/* 4. RODAPÉ EDITORIAL SUÍÇO (A SETINHA MINIMALISTA ↗ DA REFERÊNCIA)  */}
      {/* ================================================================== */}
      <footer
        className={`relative z-10 w-full px-[60px] flex items-center justify-end ${
          is916 ? "pb-24" : is45 ? "pb-16" : "pb-12"
        }`}
      >
        {/* A Setinha Minimalista Suíça do Pinterest (não exibe nos boxes puros) */}
        {variant !== "swiss-box" && variant !== "clean-ice-box" && (
          <div
            className={`w-11 h-11 rounded-full border flex items-center justify-center text-lg font-bold transition-all ${
              isLightBackground
                ? "border-black/25 text-black bg-black/[0.03]"
                : "border-white/25 text-white bg-white/[0.03]"
            }`}
          >
            ↗
          </div>
        )}
      </footer>
    </div>
  );
}
