"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  X,
  Compass,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useTourStore } from "@/store/useTourStore";

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

export function GuidedTourModal() {
  const router = useRouter();
  const {
    isActive,
    currentStepIndex,
    steps,
    hasSeenTour,
    startTour,
    nextStep,
    prevStep,
    skipTour,
  } = useTourStore();

  const [rect, setRect] = useState<TargetRect | null>(null);
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0,
  });

  // Disparo automático suave no primeiro acesso após a hidratação dos elementos
  useEffect(() => {
    if (!hasSeenTour && !isActive) {
      const autoStartTimer = setTimeout(() => {
        startTour();
      }, 700);
      return () => clearTimeout(autoStartTimer);
    }
  }, [hasSeenTour, isActive, startTour]);

  const currentStep = steps[currentStepIndex];

  // Atualiza as dimensões da janela
  useEffect(() => {
    const updateDimensions = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Localiza e mede o elemento alvo na tela sem forçar rolagem
  const measureTarget = useCallback(() => {
    if (!isActive || !currentStep) {
      setRect(null);
      return;
    }

    const targetEl = document.querySelector(`[data-tour="${currentStep.target}"]`);

    if (targetEl) {
      const bRect = targetEl.getBoundingClientRect();
      setRect({
        top: bRect.top,
        left: bRect.left,
        width: bRect.width,
        height: bRect.height,
        bottom: bRect.bottom,
        right: bRect.right,
      });
    } else {
      setRect(null);
    }
  }, [isActive, currentStep]);

  // Rola suavemente para o elemento alvo UMA ÚNICA VEZ ao trocar de passo (exceto elementos fixos da barra lateral)
  useEffect(() => {
    if (!isActive || !currentStep) return;

    // Não rola a página para elementos que já estão fixos na barra lateral ou cabeçalho
    if (
      currentStep.target.startsWith("sidebar") ||
      currentStep.target.startsWith("header")
    ) {
      return;
    }

    const targetEl = document.querySelector(`[data-tour="${currentStep.target}"]`);
    if (targetEl) {
      const bRect = targetEl.getBoundingClientRect();
      const isOutOfView =
        bRect.top < 80 ||
        bRect.bottom > window.innerHeight - 80;

      if (isOutOfView) {
        targetEl.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [isActive, currentStepIndex, currentStep]);

  useEffect(() => {
    measureTarget();

    const timer = setTimeout(measureTarget, 200);
    const scrollHandler = () => measureTarget();

    window.addEventListener("scroll", scrollHandler, { passive: true });
    window.addEventListener("resize", scrollHandler);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", scrollHandler);
      window.removeEventListener("resize", scrollHandler);
    };
  }, [measureTarget, currentStepIndex]);

  // Suporte a atalhos de teclado (Seta Direita, Seta Esquerda, Escape)
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        skipTour();
      } else if (e.key === "ArrowRight") {
        nextStep();
      } else if (e.key === "ArrowLeft") {
        prevStep();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, nextStep, prevStep, skipTour]);

  if (!isActive || !currentStep) {
    return null;
  }

  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === steps.length - 1;
  const padding = 8;

  // Cálculo da posição do Card Flutuante (Tooltip)
  let popoverStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 60,
  };

  const cardWidth = 380;
  const cardHeight = 240;

  if (rect) {
    let placement = currentStep.placement || "bottom";

    // Auto-ajuste para não vazar a tela
    if (placement === "bottom" && rect.bottom + cardHeight + 20 > windowDimensions.height) {
      placement = "top";
    }
    if (placement === "right" && rect.right + cardWidth + 20 > windowDimensions.width) {
      placement = "bottom";
    }

    if (placement === "right") {
      popoverStyle.top = Math.max(20, Math.min(windowDimensions.height - cardHeight - 20, rect.top));
      popoverStyle.left = Math.min(windowDimensions.width - cardWidth - 20, rect.right + 18);
    } else if (placement === "left") {
      popoverStyle.top = Math.max(20, Math.min(windowDimensions.height - cardHeight - 20, rect.top));
      popoverStyle.left = Math.max(20, rect.left - cardWidth - 18);
    } else if (placement === "top") {
      popoverStyle.top = Math.max(20, rect.top - cardHeight - 18);
      popoverStyle.left = Math.max(20, Math.min(windowDimensions.width - cardWidth - 20, rect.left + rect.width / 2 - cardWidth / 2));
    } else {
      // Padrão: bottom
      popoverStyle.top = Math.min(windowDimensions.height - cardHeight - 20, rect.bottom + 18);
      popoverStyle.left = Math.max(20, Math.min(windowDimensions.width - cardWidth - 20, rect.left + rect.width / 2 - cardWidth / 2));
    }
  } else {
    // Fallback centralizado se o elemento ainda não estiver visível
    popoverStyle = {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 60,
    };
  }

  const handleActionClick = () => {
    if (currentStep.actionUrl) {
      skipTour();
      router.push(currentStep.actionUrl);
    } else {
      nextStep();
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto select-none">
      {/* SVG com Máscara Escurecida e Recorte do Elemento Alvo */}
      <svg
        className="fixed inset-0 h-full w-full pointer-events-none transition-all duration-300"
        style={{ zIndex: 50 }}
      >
        <defs>
          <mask id="tour-spotlight-mask">
            {/* Base branca (opaca) */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Recorte preto (transparente na máscara) */}
            {rect && (
              <rect
                x={rect.left - padding}
                y={rect.top - padding}
                width={rect.width + padding * 2}
                height={rect.height + padding * 2}
                rx="10"
                ry="10"
                fill="black"
              />
            )}
          </mask>
        </defs>

        {/* Fundo escurecido aplicando a máscara */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(3, 3, 3, 0.82)"
          mask="url(#tour-spotlight-mask)"
        />
      </svg>

      {/* Anel de Destaque Animado ao redor do Elemento */}
      {rect && (
        <div
          className="fixed pointer-events-none transition-all duration-300 ease-out"
          style={{
            top: rect.top - padding,
            left: rect.left - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2,
            borderRadius: "10px",
            border: "2px solid #E5E4E2",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.4), 0 0 25px rgba(255, 255, 255, 0.2)",
            zIndex: 51,
          }}
        />
      )}

      {/* Card Flutuante com as Instruções Interativas */}
      <div
        style={popoverStyle}
        className="w-[90vw] max-w-[390px] rounded-xl border border-white/10 bg-[#0A0A0A] p-5 text-white shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Topo: Passo e Botão Fechar */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10/60">
          <div className="flex items-center gap-2">
            <span className="flex h-5 items-center rounded bg-accent/15 px-2 font-mono text-[10px] font-bold uppercase tracking-wider text-accent border border-white/30/25">
              Passo {currentStepIndex + 1} de {steps.length}
            </span>
            {currentStep.badge && (
              <span className="text-[11px] font-mono text-zinc-400">
                &bull; {currentStep.badge}
              </span>
            )}
          </div>

          <button
            onClick={skipTour}
            className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
            title="Pular Tutorial"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Corpo: Título e Descrição */}
        <div className="py-3.5 space-y-2">
          <h3 className="text-sm font-bold tracking-tight text-white font-mono flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent shrink-0" />
            {currentStep.title}
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {currentStep.description}
          </p>
        </div>

        {/* Rodapé: Progresso por Pontos e Navegação */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10/60">
          {/* Indicadores de Progresso */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStepIndex
                    ? "w-5 bg-accent"
                    : idx < currentStepIndex
                    ? "w-2 bg-platinum/60"
                    : "w-2 bg-white/[0.04] border border-white/10"
                }`}
              />
            ))}
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={prevStep}
                className="flex h-8 items-center gap-1 rounded-md border border-white/10 bg-[#0A0A0A] px-2.5 text-xs text-zinc-400 hover:text-white hover:border-white/20 transition-all cursor-pointer font-mono"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Voltar</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleActionClick}
              className="flex h-8 items-center gap-1.5 rounded-md bg-accent px-3 text-xs font-semibold text-void hover:bg-accent-hover transition-all cursor-pointer font-mono shadow-md"
            >
              <span>
                {currentStep.actionText
                  ? currentStep.actionText
                  : isLast
                  ? "Concluir"
                  : "Próximo"}
              </span>
              {isLast && !currentStep.actionText ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <ArrowRight className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
