import React from "react";
import { LayoutProps } from "./layoutTypes";

export function CtaLayout({
  slide,
  config,
  scale,
  isLight,
  textPrimaryClass,
  textSecondaryClass,
  borderClass,
  cardBgClass,
  renderHighlightedText,
}: LayoutProps) {
  const is916 = config.aspectRatio === "9:16";

  return (
    <div
      className={`w-full h-full flex-grow flex flex-col items-center text-center ${
        is916 ? "justify-between py-6 gap-8" : "justify-center gap-6"
      } max-w-2xl mx-auto`}
    >
      {/* Foto Grande do Autor com Anel de Destaque */}
      <div className={`relative ${is916 ? "mt-6" : ""}`}>
        {config.authorAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={config.authorAvatar}
            alt={config.authorName}
            className={`${
              is916 ? "w-36 h-36 md:w-44 md:h-44" : "w-32 h-32 md:w-36 md:h-36"
            } rounded-full object-cover shadow-2xl border-4`}
            style={{
              borderColor: config.accentColor,
              boxShadow: `0 16px 40px ${config.accentColor}40`,
            }}
          />
        ) : (
          <div
            className={`${
              is916 ? "w-36 h-36 md:w-44 md:h-44 text-5xl" : "w-32 h-32 md:w-36 md:h-36 text-4xl"
            } rounded-full flex items-center justify-center font-black shadow-2xl border-4`}
            style={{
              backgroundColor: config.accentColor,
              color: isLight ? "#09090b" : "#ffffff",
              borderColor: config.accentColor,
            }}
          >
            {config.authorName.charAt(0) || "B"}
          </div>
        )}

        {/* Selo Verificado B2B */}
        <div
          className={`${
            is916 ? "w-10 h-10" : "w-9 h-9"
          } absolute bottom-0 right-0 rounded-full flex items-center justify-center shadow-lg border-2`}
          style={{
            backgroundColor: config.accentColor,
            borderColor: config.bgColor,
            color: isLight ? "#09090b" : "#ffffff",
          }}
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Headline de Ação */}
      <div className={`space-y-4 ${is916 ? "my-auto py-4" : ""}`}>
        <span
          className="text-xs font-mono uppercase tracking-widest font-bold px-4 py-1.5 rounded-full border inline-block"
          style={{
            backgroundColor: `${config.accentColor}15`,
            borderColor: `${config.accentColor}35`,
            color: config.accentColor,
          }}
        >
          {slide.tag || "CHAMADA PARA AÇÃO"}
        </span>

        <h2
          className={`font-black tracking-tight leading-tight ${textPrimaryClass}`}
          style={{
            fontSize: is916
              ? `clamp(2.2rem, calc(3rem * ${scale}), 5rem)`
              : `clamp(2rem, calc(2.7rem * ${scale}), 4.5rem)`,
          }}
        >
          {renderHighlightedText(
            slide.headline || "Gostou deste conteúdo?",
            config.accentColor
          )}
        </h2>
        <p
          className={`font-normal leading-relaxed max-w-lg mx-auto ${textSecondaryClass}`}
          style={{
            fontSize: `clamp(1.1rem, calc(1.35rem * ${scale}), 2rem)`,
          }}
        >
          {renderHighlightedText(
            slide.bodyText ||
              "Salve para consultar mais tarde e compartilhe este insight com líderes da sua rede.",
            config.accentColor
          )}
        </p>
      </div>

      {/* Barra de Engajamento Social Presa no Limite da Safe Zone */}
      <div className="w-full space-y-3">
        {is916 && (
          <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
            <span>Toque abaixo para interagir</span>
            <span className="text-base animate-bounce" style={{ color: config.accentColor }}>
              ↓
            </span>
          </div>
        )}

        <div
          className={`w-full flex items-center justify-center gap-8 px-8 py-5 rounded-3xl border shadow-xl backdrop-blur-md ${cardBgClass} ${borderClass}`}
        >
          <div className={`flex items-center gap-2 ${textSecondaryClass}`}>
            <svg className="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span className="text-sm font-bold font-mono">Gostei</span>
          </div>
          <div className={`flex items-center gap-2 ${textSecondaryClass}`}>
            <svg className="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="text-sm font-bold font-mono">Comentar</span>
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-2xl transition-transform hover:scale-105"
            style={{
              backgroundColor: `${config.accentColor}25`,
              color: config.accentColor,
            }}
          >
            <svg className="w-6 h-6 fill-none stroke-current stroke-2 -rotate-12" viewBox="0 0 24 24">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
            <span className="text-sm font-black font-mono">
              {is916 ? "Enviar" : "Salvar"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
