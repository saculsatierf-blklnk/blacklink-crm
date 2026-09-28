"use client";

import { Check, ChevronRight, Edit3, Layers, Send, Sparkles } from "lucide-react";
import { useMarketingStore } from "@/store/useMarketingStore";
import { Step1BriefingSetup } from "./Step1BriefingSetup";
import { Step2SlideStudio } from "./Step2SlideStudio";
import { Step3GlobalReview } from "./Step3GlobalReview";

export function CreativeStudioWizard() {
  const { currentWizardStep, setWizardStep, draftCarousel } = useMarketingStore();

  const steps: { step: 1 | 2 | 3; title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }[] = [
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
    <div className="space-y-6">
      {/* Barra de Progresso do Wizard (Estilo CarrosseIA Dark Industrial) */}
      <div className="rounded-xl border border-glass-border bg-carbon/80 p-3 sm:p-4 backdrop-blur-xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isActive = currentWizardStep === s.step;
            const isCompleted = currentWizardStep > s.step;
            const canNavigate = s.step === 1 || Boolean(draftCarousel);

            return (
              <button
                key={s.step}
                type="button"
                disabled={!canNavigate}
                onClick={() => canNavigate && setWizardStep(s.step)}
                className={`flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all ${
                  isActive
                    ? "border-accent bg-accent/10 shadow-lg shadow-accent/5 ring-1 ring-accent/30"
                    : isCompleted
                    ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50 cursor-pointer"
                    : canNavigate
                    ? "border-glass-border bg-void/30 hover:border-glass-highlight hover:bg-carbon cursor-pointer"
                    : "border-glass-border/40 bg-void/20 opacity-50 cursor-not-allowed"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-mono font-bold transition-all ${
                    isActive
                      ? "bg-accent text-void"
                      : isCompleted
                      ? "bg-emerald-500 text-void"
                      : "bg-void border border-glass-border text-sub"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : `0${s.step}`}
                </div>

                <div className="flex flex-col min-w-0">
                  <span
                    className={`text-xs font-bold font-mono truncate ${
                      isActive ? "text-platinum" : isCompleted ? "text-emerald-400" : "text-sub"
                    }`}
                  >
                    {s.title}
                  </span>
                  <span className="text-[10px] text-sub truncate">{s.subtitle}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Renderização Condicional da Etapa Atual */}
      <div className="transition-all duration-300">
        {currentWizardStep === 1 && <Step1BriefingSetup />}
        {currentWizardStep === 2 && <Step2SlideStudio />}
        {currentWizardStep === 3 && <Step3GlobalReview />}
      </div>
    </div>
  );
}
