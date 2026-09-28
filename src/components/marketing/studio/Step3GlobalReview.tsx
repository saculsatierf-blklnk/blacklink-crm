"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  Hash,
  Layers,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";
import { useMarketingStore } from "@/store/useMarketingStore";

export function Step3GlobalReview() {
  const {
    draftCarousel,
    updateDraftCaption,
    updateDraftHashtags,
    saveDraftToSchedule,
    setWizardStep,
  } = useMarketingStore();

  const [scheduledDateInput, setScheduledDateInput] = useState<string>(
    draftCarousel?.scheduledDate || "Amanhã • 10:00"
  );
  const [hashtagInput, setHashtagInput] = useState<string>(
    draftCarousel?.hashtags?.join(" ") || "#VendasB2B #BlackLink #Growth #InteligenciaComercial"
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);

  if (!draftCarousel) {
    return (
      <div className="rounded-xl border border-glass-border bg-carbon p-12 text-center space-y-4">
        <Layers className="h-8 w-8 text-sub mx-auto" />
        <h3 className="text-sm font-bold font-mono text-platinum">
          Nenhum rascunho em edição
        </h3>
        <button
          type="button"
          onClick={() => setWizardStep(1)}
          className="rounded-lg bg-accent px-4 py-2 text-xs font-mono font-bold text-void cursor-pointer"
        >
          Iniciar Novo Briefing
        </button>
      </div>
    );
  }

  const handleSaveAndRedirect = async () => {
    setIsSaving(true);
    // Atualiza hashtags a partir do input
    const parsedHashtags = hashtagInput
      .split(" ")
      .map((h) => h.trim())
      .filter((h) => h.startsWith("#"));

    if (parsedHashtags.length > 0) {
      updateDraftHashtags(parsedHashtags);
    }

    const success = await saveDraftToSchedule(scheduledDateInput);
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Cabeçalho da Etapa 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-glass-border/70 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-accent/10 border border-accent/20 px-2 py-0.5 text-[10px] font-mono text-accent font-bold">
              Etapa 3 de 3: Revisão Global & Agendamento
            </span>
            <span className="text-xs text-sub font-mono">
              &bull; {draftCarousel.theme}
            </span>
          </div>
          <p className="text-xs text-sub mt-1">
            Revise a legenda executiva, ajuste as hashtags e confirme a alocação no cronograma multi-tenant.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setWizardStep(2)}
          className="flex items-center gap-1.5 rounded-lg border border-glass-border bg-void/50 px-3 py-1.5 text-xs font-mono text-sub hover:text-platinum transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Voltar aos Slides</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna da Esquerda: Resumo Visual das Lâminas */}
        <div className="lg:col-span-5 rounded-xl border border-glass-border bg-carbon p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-platinum flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-accent" />
              <span>Resumo do Ativo ({draftCarousel.slides?.length || 0} slides)</span>
            </h3>
            <span className="rounded bg-void border border-glass-border px-2 py-0.5 text-[10px] font-mono text-sub uppercase">
              {draftCarousel.format}
            </span>
          </div>

          {/* Lâmina de Destaque (Capa / Gancho) */}
          <div className="relative aspect-square w-full rounded-lg border border-glass-border bg-void overflow-hidden shadow-inner">
            {draftCarousel.slides?.[0]?.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={draftCarousel.slides[0].imageUrl}
                alt="Lâmina de Capa"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="p-4 text-center">
                <span className="text-xs font-mono font-bold text-platinum">
                  {draftCarousel.hookHeadline}
                </span>
              </div>
            )}
            <div className="absolute bottom-2 left-2 rounded bg-void/80 border border-glass-border px-2 py-0.5 text-[10px] font-mono text-platinum">
              Capa & Gancho Principal
            </div>
          </div>

          {/* Título de Cada Slide para Auditoria Rápida */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-mono uppercase text-sub">Estrutura das Lâminas:</span>
            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {draftCarousel.slides?.map((s, idx) => (
                <div
                  key={idx}
                  className="rounded border border-glass-border/60 bg-void/60 p-2 text-xs font-mono flex items-center gap-2"
                >
                  <span className="text-accent font-bold">0{idx + 1}</span>
                  <span className="text-platinum truncate text-[11px] font-sans">
                    {s.headline}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna da Direita: Editor de Legenda, Hashtags & Botão Primário */}
        <div className="lg:col-span-7 rounded-xl border border-glass-border bg-carbon p-6 space-y-5 shadow-2xl">
          {/* Legenda do Post (Caption / BodyCopy) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="postCaption"
                className="text-xs font-mono font-semibold uppercase tracking-wider text-sub flex items-center gap-1.5"
              >
                <Edit3 className="h-3.5 w-3.5 text-accent" />
                <span>Legenda do Post (Caption Completa)</span>
              </label>
              <span className="text-[10px] font-mono text-emerald-400">
                Ajuste fino executivo
              </span>
            </div>
            <textarea
              id="postCaption"
              rows={8}
              value={draftCarousel.bodyCopy}
              onChange={(e) => updateDraftCaption(e.target.value)}
              placeholder="Digite a legenda persuasiva para a publicação..."
              className="w-full rounded-lg border border-glass-border bg-void/70 p-3.5 text-xs font-sans text-platinum placeholder:text-sub/50 focus:border-glass-highlight focus:outline-none focus:ring-1 focus:ring-accent/50 resize-y leading-relaxed"
            />
          </div>

          {/* Hashtags Estratégicas */}
          <div className="space-y-1.5">
            <label
              htmlFor="postHashtags"
              className="text-xs font-mono font-semibold uppercase tracking-wider text-sub flex items-center gap-1.5"
            >
              <Hash className="h-3.5 w-3.5 text-accent" />
              <span>Hashtags do Nicho</span>
            </label>
            <input
              id="postHashtags"
              type="text"
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              placeholder="#VendasB2B #BlackLink #InteligenciaComercial"
              className="w-full rounded-lg border border-glass-border bg-void/70 p-2.5 text-xs font-mono text-platinum placeholder:text-sub/50 focus:border-glass-highlight focus:outline-none"
            />
          </div>

          {/* Data e Horário Sugerido */}
          <div className="space-y-1.5">
            <label
              htmlFor="postDate"
              className="text-xs font-mono font-semibold uppercase tracking-wider text-sub flex items-center gap-1.5"
            >
              <Clock className="h-3.5 w-3.5 text-accent" />
              <span>Data e Horário de Alocação no Cronograma</span>
            </label>
            <input
              id="postDate"
              type="text"
              value={scheduledDateInput}
              onChange={(e) => setScheduledDateInput(e.target.value)}
              placeholder="Ex: Amanhã • 10:00 ou 2026-10-02 14:00"
              className="w-full rounded-lg border border-glass-border bg-void/70 p-2.5 text-xs font-mono text-platinum placeholder:text-sub/50 focus:border-glass-highlight focus:outline-none"
            />
          </div>

          {/* Botão Primário: Salvar e Enviar para Cronograma & Aprovação */}
          <div className="pt-3 border-t border-glass-border/70">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveAndRedirect}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3.5 text-xs font-bold font-mono text-void hover:bg-platinum transition-all cursor-pointer shadow-lg hover:shadow-accent/20 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-void" />
                  <span>Salvando no Supabase & Cronograma...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 fill-void" />
                  <span>Enviar para o Cronograma & Aprovar</span>
                </>
              )}
            </button>
            <p className="text-[10px] font-mono text-sub text-center mt-2">
              O ativo será persistido no Supabase na conta do cliente e você será conduzido à mesa de aprovação.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
