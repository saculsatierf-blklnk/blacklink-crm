"use client";

import { Check, Edit3, Send, Sparkles } from "lucide-react";
import { useMarketingStore } from "@/store/useMarketingStore";
import { Step1BriefingSetup } from "./Step1BriefingSetup";
import { Step2SlideStudio } from "./Step2SlideStudio";
import { Step3GlobalReview } from "./Step3GlobalReview";

export function CreativeStudioWizard() {
  const { currentWizardStep, setWizardStep, draftCarousel } = useMarketingStore();

  const steps: {
    step: 1 | 2 | 3;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      step: 1,
      title: "Briefing & Setup",
      subtitle: "Nicho, ICP & Formato",
      icon: Sparkles,
    },
    {
      step: 2,
      title: "Estúdio Slide a Slide",
      subtitle: "Edição Direta & Preview Live",
      icon: Edit3,
    },
    {
      step: 3,
      title: "Revisão & Agendamento",
      subtitle: "Legenda & Supabase",
      icon: Send,
    },
  ];

  return (
    <div className="space-y-12">
      {/* Barra de Progresso do Wizard: Fórmula Exata de Vidro Apple com Filete de Refração */}
      <div className="relative overflow-hidden rounded-3xl bg-white/[0.02] border border-white/[0.08] p-6 lg:p-8 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:bg-white/[0.03]">
        {/* Linha de brilho (refração) no topo do card */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

        <div className="relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {steps.map((s) => {
              const isActive = currentWizardStep === s.step;
              const isCompleted = currentWizardStep > s.step;
              const canNavigate = s.step === 1 || Boolean(draftCarousel);

              return (
                <button
                  key={s.step}
                  type="button"
                  disabled={!canNavigate}
                  onClick={() => canNavigate && setWizardStep(s.step)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-300 ${
                    isActive
                      ? "border-white/30 bg-white/[0.10] shadow-xl shadow-black/40 ring-1 ring-white/20"
                      : isCompleted
                      ? "border-emerald-500/30 bg-emerald-500/10 hover:border-emerald-500/50 cursor-pointer"
                      : canNavigate
                      ? "border-white/5 bg-transparent hover:border-white/15 hover:bg-white/[0.04] cursor-pointer"
                      : "border-transparent bg-transparent opacity-40 cursor-not-allowed"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-semibold transition-all duration-300 ${
                      isActive
                        ? "bg-white text-black shadow-sm"
                        : isCompleted
                        ? "bg-emerald-500 text-white"
                        : "bg-white/[0.05] border border-white/10 text-zinc-400"
                    }`}
                  >
                    {isCompleted ? <Check className="h-4 w-4 stroke-[2.5]" /> : `0${s.step}`}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span
                      className={`text-xs font-semibold tracking-tight truncate ${
                        isActive ? "text-white" : isCompleted ? "text-emerald-400" : "text-zinc-400"
                      }`}
                    >
                      {s.title}
                    </span>
                    <span className="text-[11px] text-zinc-500 truncate mt-0.5">{s.subtitle}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Renderização Condicional da Etapa Atual com Respiro & Animação */}
      <div className="transition-all duration-300">
        {currentWizardStep === 1 && <Step1BriefingSetup />}
        {currentWizardStep === 2 && <Step2SlideStudio />}
        {currentWizardStep === 3 && <Step3GlobalReview />}
      </div>
    </div>
  );
}
