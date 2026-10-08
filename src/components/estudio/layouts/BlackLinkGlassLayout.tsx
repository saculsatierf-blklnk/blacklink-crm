import React from "react";
import { LayoutProps, BlackLinkStyleVariant } from "./layoutTypes";

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

  // Conteúdo
  const rawHeadline = (slide.headline || "").trim();
  const rawBody = (slide.bodyText || "").trim();
  const rawTag = (slide.tag || "ESTRATÉGIA").trim().toUpperCase();

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
  const renderHighlight = (text: string, forceLightText = false) => {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const clean = part.slice(2, -2);
        return (
          <span
            key={index}
            className={`font-black underline underline-offset-[10px] inline ${
              forceLightText || !isLightBackground
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

  // Formata o título para não virar um bloco maciço: divide em até 3 linhas elegantes
  const formatHeadline = (text: string) => {
    if (!text) return "BLACK LINK OS";
    // Se o texto tiver menos de 35 caracteres, exibe direto
    if (text.length <= 35) return text;
    // Divide mantendo ritmo
    const words = text.split(" ");
    if (words.length <= 4) return text;
    const mid = Math.ceil(words.length / 2);
    return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")].join("\n");
  };

  const displayHeadline = formatHeadline(rawHeadline);

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
                  ? "contrast(105%) brightness(98%)"
                  : "contrast(115%) brightness(95%)",
            }}
          />
          {/* Vinheta atmosférica suave apenas para posts escuros com 3D */}
          {!isLightBackground && (
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, rgba(3, 3, 5, 0.1) 0%, rgba(2, 2, 4, 0.5) 70%, rgba(1, 1, 2, 0.85) 100%)",
              }}
            />
          )}
        </div>
      )}

      {/* Margens Guias Sutis de Precisão (80px) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          className={`absolute top-0 bottom-0 left-[80px] w-px ${
            isLightBackground ? "bg-black/[0.06]" : "bg-white/[0.05]"
          }`}
        />
        <div
          className={`absolute top-0 bottom-0 right-[80px] w-px ${
            isLightBackground ? "bg-black/[0.06]" : "bg-white/[0.05]"
          }`}
        />
      </div>

      {/* ================================================================== */}
      {/* 2. CABEÇALHO EDITORIAL SUÍÇO (DESIGN.BLACKLINK // 2026)            */}
      {/* ================================================================== */}
      <header
        className={`relative z-10 w-full px-[80px] flex items-center justify-between text-xs font-mono tracking-[0.25em] ${
          isLightBackground ? "text-zinc-600" : "text-zinc-400"
        } ${is916 ? "pt-24" : is45 ? "pt-16" : "pt-14"}`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isLightBackground
                ? "bg-black shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                : "bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]"
            }`}
          />
          <span
            className={`font-bold uppercase tracking-[0.3em] text-[13px] ${
              isLightBackground ? "text-black" : "text-white"
            }`}
          >
            DESIGN.BLACKLINK
          </span>
        </div>

        <div className="font-bold tracking-widest text-[13px]">
          2026
        </div>
      </header>

      {/* ================================================================== */}
      {/* 3. NÚCLEO EDITORIAL CONFORME A VARIAÇÃO VISUAL                     */}
      {/* ================================================================== */}

      {/* ------------------------------------------------------------------ */}
      {/* VARIAÇÃO A: SWISS BOX & CLEAN ICE BOX (BOUNDING BOX COM 8 HANDLES) */}
      {/* ------------------------------------------------------------------ */}
      {(variant === "swiss-box" || variant === "clean-ice-box") && (
        <main className="relative z-10 w-full px-[80px] my-auto flex flex-col justify-center items-center text-center">
          {/* A Bounding Box Técnica Vetorial com 8 Handles */}
          <div className="relative inline-block px-14 py-8 mb-6 max-w-[880px]">
            {/* Contorno fino */}
            <div
              className={`absolute inset-0 border ${
                variant === "clean-ice-box"
                  ? "border-black/50 bg-black/[0.02]"
                  : "border-white/40 backdrop-blur-[2px] bg-white/[0.03]"
              }`}
            />
            {/* 4 Handles nos 4 cantos */}
            <span
              className={`absolute -top-1.5 -left-1.5 w-3 h-3 ${
                variant === "clean-ice-box" ? "bg-black border border-white" : "bg-white border border-black"
              }`}
            />
            <span
              className={`absolute -top-1.5 -right-1.5 w-3 h-3 ${
                variant === "clean-ice-box" ? "bg-black border border-white" : "bg-white border border-black"
              }`}
            />
            <span
              className={`absolute -bottom-1.5 -left-1.5 w-3 h-3 ${
                variant === "clean-ice-box" ? "bg-black border border-white" : "bg-white border border-black"
              }`}
            />
            <span
              className={`absolute -bottom-1.5 -right-1.5 w-3 h-3 ${
                variant === "clean-ice-box" ? "bg-black border border-white" : "bg-white border border-black"
              }`}
            />
            {/* 4 Handles no centro de cada aresta */}
            <span
              className={`absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 ${
                variant === "clean-ice-box" ? "bg-black border border-white" : "bg-white border border-black"
              }`}
            />
            <span
              className={`absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 ${
                variant === "clean-ice-box" ? "bg-black border border-white" : "bg-white border border-black"
              }`}
            />
            <span
              className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 ${
                variant === "clean-ice-box" ? "bg-black border border-white" : "bg-white border border-black"
              }`}
            />
            <span
              className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 ${
                variant === "clean-ice-box" ? "bg-black border border-white" : "bg-white border border-black"
              }`}
            />

            {/* Termo Principal dentro da Bounding Box */}
            <h1
              className={`relative z-10 font-clash font-extrabold uppercase tracking-[0.25em] text-3xl md:text-5xl leading-tight ${
                variant === "clean-ice-box" ? "text-black" : "text-white"
              }`}
            >
              {rawHeadline || rawTag}
            </h1>
          </div>

          {/* Subtítulo técnico sutil */}
          {rawBody && (
            <p
              className={`font-mono text-sm max-w-lg mx-auto tracking-wide leading-relaxed ${
                variant === "clean-ice-box" ? "text-zinc-600" : "text-zinc-400"
              }`}
            >
              {rawBody}
            </p>
          )}
        </main>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* VARIAÇÃO B: OBJETOS 3D (3D CURSOR, 3D KEYCAP, 3D CRYSTAL, 3D SCULPTURE) */}
      {/* Título editorial arrojado no canto superior esquerdo com respiro    */}
      {/* ------------------------------------------------------------------ */}
      {(variant === "3d-cursor" ||
        variant === "3d-keycap" ||
        variant === "3d-crystal" ||
        variant === "3d-sculpture") && (
        <main className="relative z-10 w-full px-[80px] mt-4 mb-auto flex flex-col justify-start items-start text-left">
          {/* Título Editorial no Canto Superior Esquerdo */}
          <div className="max-w-[620px] space-y-3">
            <h1
              className={`font-clash font-extrabold tracking-tight uppercase leading-[1.05] whitespace-pre-line ${
                isLightBackground
                  ? "text-black"
                  : "text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]"
              }`}
              style={{
                fontSize: displayHeadline.length > 50 ? "46px" : "56px",
                letterSpacing: "-0.03em",
              }}
            >
              {renderHighlight(displayHeadline)}
              <span className="text-xl align-super ml-1 opacity-70">©</span>
            </h1>

            {rawBody && (
              <p
                className={`text-xs font-mono tracking-wider max-w-md ${
                  isLightBackground ? "text-zinc-600" : "text-zinc-400"
                }`}
              >
                // {rawBody.slice(0, 90)}
              </p>
            )}
          </div>
        </main>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* VARIAÇÃO C: 3D LIQUID (TÍTULO NO CANTO INFERIOR ESQUERDO)          */}
      {/* ------------------------------------------------------------------ */}
      {variant === "3d-liquid" && (
        <main className="relative z-10 w-full px-[80px] mt-auto mb-6 flex flex-col justify-end items-start text-left">
          <div className="max-w-[650px] space-y-3">
            <h1
              className="font-clash font-extrabold tracking-tight uppercase leading-[1.05] text-white whitespace-pre-line drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]"
              style={{
                fontSize: displayHeadline.length > 50 ? "46px" : "56px",
                letterSpacing: "-0.03em",
              }}
            >
              {renderHighlight(displayHeadline)}
              <span className="text-xl align-super ml-1 opacity-70">©</span>
            </h1>

            {rawBody && (
              <p className="text-xs font-mono tracking-wider text-zinc-300 max-w-md drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                // {rawBody.slice(0, 90)}
              </p>
            )}
          </div>
        </main>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* VARIAÇÃO D: PURE MONUMENTAL & CLEAN ICE (TIPOGRAFIA CENTRAL PURA)   */}
      {/* ------------------------------------------------------------------ */}
      {(variant === "pure-monumental" || variant === "clean-ice") && (
        <main className="relative z-10 w-full px-[80px] my-auto flex flex-col justify-center items-start text-left">
          <div className="max-w-[850px] space-y-6">
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-[0.25em] ${
                isLightBackground
                  ? "bg-black/10 text-black border border-black/20"
                  : "bg-white/10 text-white border border-white/20"
              }`}
            >
              // {rawTag}
            </span>

            <h1
              className={`font-clash font-black tracking-tight uppercase leading-[1.04] whitespace-pre-line ${
                isLightBackground ? "text-black" : "text-white"
              }`}
              style={{
                fontSize: displayHeadline.length > 55 ? "50px" : "66px",
                letterSpacing: "-0.04em",
              }}
            >
              {renderHighlight(displayHeadline)}
            </h1>

            {/* Linha Divisória de Precisão */}
            <div
              className={`w-20 h-[1.5px] ${
                isLightBackground ? "bg-black/40" : "bg-white/40"
              }`}
            />

            {rawBody && (
              <p
                className={`font-inter font-normal max-w-xl text-lg leading-relaxed ${
                  isLightBackground ? "text-zinc-700" : "text-zinc-300"
                }`}
              >
                {renderHighlight(rawBody)}
              </p>
            )}
          </div>
        </main>
      )}

      {/* ================================================================== */}
      {/* 4. RODAPÉ EDITORIAL SUÍÇO (A SETINHA MINIMALISTA ↗ DA REFERÊNCIA)  */}
      {/* ================================================================== */}
      <footer
        className={`relative z-10 w-full px-[80px] flex items-center justify-between text-xs font-mono ${
          isLightBackground ? "text-zinc-600" : "text-zinc-400"
        } ${is916 ? "pb-24" : is45 ? "pb-16" : "pb-14"}`}
      >
        <div
          className={`tracking-[0.25em] uppercase font-bold text-[13px] ${
            isLightBackground ? "text-black" : "text-zinc-300"
          }`}
        >
          {rawTag || "DIRETRIZ DE ELITE"}
        </div>

        {/* A Setinha Diagonal Minimalista Suíça do Pinterest */}
        <div
          className={`w-12 h-12 rounded-full border flex items-center justify-center text-xl font-bold transition-all ${
            isLightBackground
              ? "border-black/30 text-black bg-black/[0.04]"
              : "border-white/30 text-white bg-white/[0.04]"
          }`}
        >
          ↗
        </div>
      </footer>
    </div>
  );
}
