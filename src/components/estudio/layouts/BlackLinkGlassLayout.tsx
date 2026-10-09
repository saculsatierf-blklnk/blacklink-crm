import React from "react";
import { LayoutProps, BlackLinkStyleVariant } from "./layoutTypes";

/**
 * Função de Destilação Editorial de Alto Luxo:
 * Converte qualquer texto nos termos conceituais concisos de 1 a 3 palavras
 * das referências da Arina TVA / Design Atum.
 */
function distillHeadline(rawText: string, variant: BlackLinkStyleVariant): string {
  const text = (rawText || "").replace(/["'”]/g, "").trim();

  // Se o usuário digitou qualquer título customizado, RESPEITA 100% o texto do usuário (estilo Canva)
  if (text) {
    return text.toUpperCase();
  }

  // Mapeamentos oficiais por variante idênticos ao padrão Arina TVA / Design Atum (somente se vazio)
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

    case "3d-sculpture":
      return "QUALIFICAÇÃO DE\nALTO TICKET";

    case "clean-ice":
      return "DOSSIÊ EXECUTIVO\nDE ESCALA";

    case "clean-ice-box":
      return "ENGENHARIA DA\nAUSÊNCIA";

    default:
      return "BLACK LINK OS";
  }
}

/**
 * Template Antigravity — Black Link (1.0)
 * Pôster Editorial Suíço Brutalista de Alta Moda / Branding Internacional
 * Inspirado fielmente nas coleções de referências:
 * - @ARINA_TVA | IG @DESIGN_ATUM (Objetos 3D Octane, Bounding boxes técnicas com handles, fotografias editoriais)
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

  // Fundos claros (Porcelana / Gelo) na grade 3x3:
  // Post 3 (Pins cromados), Post 5 (Cursor cromado central) e Post 9 (Ice box)
  const isLightBackground =
    variant === "3d-crystal" ||
    variant === "3d-cursor" ||
    variant === "clean-ice-box";

  // Imagens de fundo oficiais para as variações de Alta Moda (Arina TVA)
  const bgImageSrc = (() => {
    if (
      slide.imageUrl &&
      !slide.imageUrl.includes("render-slide") &&
      !slide.imageUrl.includes("pollinations.ai")
    ) {
      return slide.imageUrl;
    }
    if (
      config.bgImage &&
      !config.bgImage.includes("render-slide") &&
      !config.bgImage.includes("pollinations.ai")
    ) {
      return config.bgImage;
    }
    switch (variant) {
      case "swiss-box":
        return "/brand/blacklink-art-gradient.jpg";
      case "3d-keycap":
        return "/brand/blacklink-3d-keycap.jpg";
      case "3d-crystal":
        return "/brand/blacklink-art-pins.jpg";
      case "pure-monumental":
        return "/brand/blacklink-art-portrait.jpg";
      case "3d-cursor":
        return "/brand/blacklink-art-cursor-light.jpg";
      case "3d-liquid":
        return "/brand/blacklink-art-glass-model.jpg";
      case "3d-sculpture":
        return "/brand/blacklink-art-macro-glass.jpg";
      case "clean-ice":
        return "/brand/blacklink-art-obsidian-dark.jpg";
      case "clean-ice-box":
        return null;
      default:
        return "/brand/blacklink-art-cursor-light.jpg";
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
      {/* 1. CAMADA DE FUNDO / IMAGEM DE ARTE EDITORIAL                      */}
      {/* ================================================================== */}
      {bgImageSrc && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bgImageSrc}
            alt="Arte de Fundo Black Link"
            crossOrigin="anonymous"
            className="w-full h-full object-cover transition-all duration-700 pointer-events-none select-none"
            style={{
              filter: isLightBackground
                ? "contrast(102%) brightness(100%)"
                : variant === "pure-monumental" || variant === "3d-liquid"
                ? "contrast(110%) brightness(95%)"
                : "contrast(108%) brightness(98%)",
            }}
          />
          {/* Vinheta atmosférica suave apenas para posts fotográficos ou escuros */}
          {!isLightBackground && variant !== "swiss-box" && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  variant === "pure-monumental" || variant === "3d-liquid"
                    ? "linear-gradient(to top, rgba(3, 3, 5, 0.75) 0%, rgba(3, 3, 5, 0.15) 50%, rgba(3, 3, 5, 0.4) 100%)"
                    : "radial-gradient(circle at 50% 50%, rgba(3, 3, 5, 0.05) 0%, rgba(2, 2, 4, 0.4) 70%, rgba(1, 1, 2, 0.8) 100%)",
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
          isLightBackground ? "text-black/60" : "text-white/60"
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
      {/* ------------------------------------------------------------------ */}
      {(variant === "swiss-box" || variant === "clean-ice-box") && (
        <main className="relative z-10 w-full px-[60px] my-auto flex flex-col justify-center items-center text-center">
          <div className="relative inline-block px-10 py-6 max-w-[840px]">
            {/* Contorno fino com fundo de vidro fosco */}
            <div
              className={`absolute inset-0 border ${
                variant === "clean-ice-box"
                  ? "border-black/60 bg-black/[0.02]"
                  : "border-white/50 backdrop-blur-[4px] bg-white/[0.04]"
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

            {/* Tag Editorial Suíça opcional */}
            {slide.tag && (
              <div
                className={`relative z-10 text-[11px] font-mono uppercase tracking-[0.25em] font-bold pb-2 ${
                  variant === "clean-ice-box" ? "text-black/60" : "text-white/60"
                }`}
              >
                {slide.tag}
              </div>
            )}

            {/* Termo Principal dentro da Bounding Box */}
            <h1
              className={`relative z-10 font-clash font-bold uppercase tracking-[0.18em] leading-tight py-1 ${
                variant === "clean-ice-box" ? "text-black" : "text-white"
              }`}
              style={{
                fontSize: displayHeadline.length > 40 ? "24px" : displayHeadline.length > 25 ? "28px" : "32px",
              }}
            >
              {displayHeadline}
            </h1>

            {/* Tese / Linha de Apoio opcional */}
            {slide.bodyText && (
              <p
                className={`relative z-10 text-xs md:text-sm font-sans max-w-[560px] mx-auto pt-2.5 leading-relaxed tracking-normal ${
                  variant === "clean-ice-box" ? "text-zinc-700" : "text-zinc-300"
                }`}
              >
                {slide.bodyText}
              </p>
            )}
          </div>
        </main>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* VARIAÇÃO B: 3D KEYCAP, 3D CRYSTAL (PINS), 3D CURSOR                */}
      {/* Título editorial compacto no canto superior esquerdo com respiro    */}
      {/* ------------------------------------------------------------------ */}
      {(variant === "3d-cursor" ||
        variant === "3d-keycap" ||
        variant === "3d-crystal") && (
        <main className="relative z-10 w-full px-[60px] mt-2 mb-auto flex flex-col justify-start items-start text-left">
          <div className="max-w-[560px] space-y-2.5">
            {slide.tag && (
              <div
                className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-mono uppercase tracking-[0.25em] font-semibold ${
                  isLightBackground
                    ? "border-black/20 text-black/70 bg-black/[0.03]"
                    : "border-white/20 text-white/70 bg-white/[0.05]"
                }`}
              >
                {slide.tag}
              </div>
            )}
            <h1
              className={`font-clash font-extrabold uppercase leading-[1.08] whitespace-pre-line tracking-tight ${
                isLightBackground
                  ? "text-black"
                  : "text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]"
              }`}
              style={{
                fontSize: displayHeadline.length > 50 ? "26px" : displayHeadline.length > 30 ? "30px" : "36px",
                letterSpacing: "-0.02em",
              }}
            >
              {renderHighlight(displayHeadline)}
              <span className="text-xl align-super ml-1 opacity-70">©</span>
            </h1>
            {slide.bodyText && (
              <p
                className={`text-sm font-sans leading-relaxed tracking-normal max-w-[480px] font-medium pt-0.5 ${
                  isLightBackground
                    ? "text-zinc-700"
                    : "text-zinc-300 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
                }`}
              >
                {slide.bodyText}
              </p>
            )}
          </div>
        </main>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* VARIAÇÃO C: FOTOGRAFIA EDITORIAL & ESCULTURAS MACRO                */}
      {/* (PORTRAIT, FLUTED GLASS, MACRO GLASS, OBSIDIAN DARK)               */}
      {/* Título editorial no canto inferior esquerdo com respiro            */}
      {/* ------------------------------------------------------------------ */}
      {(variant === "pure-monumental" ||
        variant === "3d-liquid" ||
        variant === "3d-sculpture" ||
        variant === "clean-ice") && (
        <main className="relative z-10 w-full px-[60px] mt-auto mb-4 flex flex-col justify-end items-start text-left">
          <div className="max-w-[580px] space-y-2.5">
            {slide.tag && (
              <div
                className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-mono uppercase tracking-[0.25em] font-semibold ${
                  isLightBackground
                    ? "border-black/20 text-black/70 bg-black/[0.03]"
                    : "border-white/20 text-white/70 bg-white/[0.05]"
                }`}
              >
                {slide.tag}
              </div>
            )}
            <h1
              className={`font-clash font-extrabold uppercase leading-[1.08] whitespace-pre-line tracking-tight ${
                isLightBackground
                  ? "text-black"
                  : "text-white drop-shadow-[0_4px_28px_rgba(0,0,0,0.95)]"
              }`}
              style={{
                fontSize: displayHeadline.length > 50 ? "26px" : displayHeadline.length > 30 ? "30px" : "36px",
                letterSpacing: "-0.02em",
              }}
            >
              {renderHighlight(displayHeadline)}
              <span className="text-xl align-super ml-1 opacity-70">©</span>
            </h1>
            {slide.bodyText && (
              <p
                className={`text-sm font-sans leading-relaxed tracking-normal max-w-[480px] font-medium pt-0.5 ${
                  isLightBackground
                    ? "text-zinc-700"
                    : "text-zinc-300 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
                }`}
              >
                {slide.bodyText}
              </p>
            )}
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
