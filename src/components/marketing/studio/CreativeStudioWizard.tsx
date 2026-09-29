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
    <div className="space-y-10">
      {/* Barra de Progresso do Wizard: Card Container Apple Glassmorphism com Respiro */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-3 sm:p-4 shadow-2xl shadow-black/50">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                className={`flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-all duration-300 ${
                  isActive
                    ? "border-white/30 bg-white/[0.12] shadow-lg shadow-black/40 ring-1 ring-white/20"
                    : isCompleted
                    ? "border-emerald-500/30 bg-emerald-500/10 hover:border-emerald-500/50 cursor-pointer"
                    : canNavigate
                    ? "border-white/5 bg-transparent hover:border-white/15 hover:bg-white/[0.04] cursor-pointer"
                    : "border-transparent bg-transparent opacity-40 cursor-not-allowed"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-semibold transition-all duration-300 ${
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

      {/* Renderização Condicional da Etapa Atual com Respiro & Transição */}
      <div className="transition-all duration-300">
        {currentWizardStep === 1 && <Step1BriefingSetup />}
        {currentWizardStep === 2 && <Step2SlideStudio />}
        {currentWizardStep === 3 && <Step3GlobalReview />}
      </div>
    </div>
  );
}
