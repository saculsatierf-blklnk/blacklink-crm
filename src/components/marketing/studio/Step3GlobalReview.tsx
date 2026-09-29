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
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-12 text-center space-y-4">
        <Layers className="h-8 w-8 text-zinc-400 mx-auto" />
        <h3 className="text-base font-semibold tracking-tight text-white">
          Nenhum rascunho em edição
        </h3>
        <button
          type="button"
          onClick={() => setWizardStep(1)}
          className="rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-black hover:bg-zinc-200 transition-all cursor-pointer"
        >
          Iniciar Novo Briefing
        </button>
      </div>
    );
  }

  const handleSaveAndRedirect = async () => {
    setIsSaving(true);
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Cabeçalho da Etapa 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="rounded-full bg-white/[0.08] border border-white/15 px-3 py-1 text-[11px] font-mono tracking-widest text-zinc-300 font-semibold uppercase">
              Etapa 3 de 3: Revisão Global & Agendamento
            </span>
            <span className="text-xs text-zinc-400 font-medium truncate">
              &bull; {draftCarousel.theme}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            Revise a legenda executiva, ajuste as hashtags e confirme a alocação no cronograma multi-tenant.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setWizardStep(2)}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Voltar aos Slides</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna da Esquerda: Resumo Visual das Lâminas */}
        <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-6 sm:p-7 space-y-5 shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-300 flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-white" />
              <span>Resumo ({draftCarousel.slides?.length || 0} slides)</span>
            </h3>
            <span className="rounded-full bg-white/[0.06] border border-white/10 px-2.5 py-0.5 text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
              {draftCarousel.format}
            </span>
          </div>

          {/* Lâmina de Destaque (Capa / Gancho) */}
          <div className="relative aspect-square w-full rounded-2xl border border-white/15 bg-black/60 overflow-hidden shadow-inner">
            {draftCarousel.slides?.[0]?.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={draftCarousel.slides[0].imageUrl}
                alt="Lâmina de Capa"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="p-6 text-center">
                <span className="text-xs font-semibold text-white tracking-tight">
                  {draftCarousel.hookHeadline}
                </span>
              </div>
            )}
            <div className="absolute bottom-3 left-3 rounded-xl bg-black/70 border border-white/15 px-3 py-1 text-[10px] font-mono text-white backdrop-blur-md">
              Capa & Gancho Principal
            </div>
          </div>

          {/* Título de Cada Slide para Auditoria Rápida */}
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
              Estrutura das Lâminas:
            </span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {draftCarousel.slides?.map((s, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5 text-xs flex items-center gap-2.5"
                >
                  <span className="text-white font-mono font-bold text-[11px]">0{idx + 1}</span>
                  <span className="text-zinc-300 truncate text-xs font-normal">
                    {s.headline}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna da Direita: Editor de Legenda, Hashtags & Botão Primário */}
        <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-black/50">
          {/* Legenda do Post (Caption / BodyCopy) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="postCaption"
                className="text-xs font-semibold tracking-tight text-zinc-300 flex items-center gap-2"
              >
                <Edit3 className="h-3.5 w-3.5 text-white" />
                <span>Legenda do Post (Caption Completa)</span>
              </label>
              <span className="text-[10px] font-mono text-emerald-400 font-medium">
                Ajuste fino executivo
              </span>
            </div>
            <textarea
              id="postCaption"
              rows={8}
              value={draftCarousel.bodyCopy}
              onChange={(e) => updateDraftCaption(e.target.value)}
              placeholder="Digite a legenda persuasiva para a publicação..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-white placeholder:text-zinc-500 focus:bg-white/[0.07] focus:border-white/30 focus:outline-none transition-all resize-y leading-relaxed"
            />
          </div>

          {/* Hashtags Estratégicas */}
          <div className="space-y-2">
            <label
              htmlFor="postHashtags"
              className="text-xs font-semibold tracking-tight text-zinc-300 flex items-center gap-2"
            >
              <Hash className="h-3.5 w-3.5 text-white" />
              <span>Hashtags do Nicho</span>
            </label>
            <input
              id="postHashtags"
              type="text"
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              placeholder="#VendasB2B #BlackLink #InteligenciaComercial"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs font-mono text-white placeholder:text-zinc-500 focus:bg-white/[0.07] focus:border-white/30 focus:outline-none transition-all"
            />
          </div>

          {/* Data e Horário Sugerido */}
          <div className="space-y-2">
            <label
              htmlFor="postDate"
              className="text-xs font-semibold tracking-tight text-zinc-300 flex items-center gap-2"
            >
              <Clock className="h-3.5 w-3.5 text-white" />
              <span>Data e Horário no Cronograma</span>
            </label>
            <input
              id="postDate"
              type="text"
              value={scheduledDateInput}
              onChange={(e) => setScheduledDateInput(e.target.value)}
              placeholder="Ex: Amanhã • 10:00 ou 2026-10-02 14:00"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs font-mono text-white placeholder:text-zinc-500 focus:bg-white/[0.07] focus:border-white/30 focus:outline-none transition-all"
            />
          </div>

          {/* Botão Primário: Salvar e Enviar para Cronograma & Aprovação */}
          <div className="pt-4 border-t border-white/10">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveAndRedirect}
              className="w-full h-12 flex items-center justify-center gap-2.5 rounded-xl bg-white text-black font-semibold text-xs tracking-tight hover:bg-zinc-200 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-[0_0_25px_rgba(255,255,255,0.2)] disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                  <span>Salvando no Supabase & Cronograma...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 fill-black" />
                  <span>Enviar para o Cronograma & Aprovar</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-zinc-500 text-center mt-2.5">
              O ativo será persistido no Supabase na conta do cliente e você será conduzido à mesa de aprovação.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
