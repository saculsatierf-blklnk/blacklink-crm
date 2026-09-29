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
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-12 text-center space-y-4">
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

    await saveDraftToSchedule(scheduledDateInput);
    setIsSaving(false);
  };

  return (
    <div className="animate-in fade-in duration-300 mb-12">
      {/* 12-COLUMN GRID SYSTEM: AUDITORIA DAS LÂMINAS (5 Colunas) vs LEGENDA & AGENDAMENTO (7 Colunas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* COLUNA ESQUERDA (5 Colunas): Resumo Visual das Lâminas */}
        <div className="col-span-12 lg:col-span-5 rounded-2xl bg-white/5 border border-white/10 p-6 lg:p-8 shadow-2xl shadow-black/50 space-y-6">
          {/* Card Header Obrigatório */}
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-black shadow-sm">
                <Layers className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight text-white">
                Dossiê das Lâminas
              </h2>
            </div>
            <span className="rounded-full bg-white/[0.06] border border-white/10 px-2.5 py-0.5 text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
              {draftCarousel.format} &bull; {draftCarousel.slides?.length || 0} slides
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
              Capa &amp; Gancho Principal
            </div>
          </div>

          {/* Título de Cada Slide para Auditoria Rápida */}
          <div className="space-y-2 pt-2">
            <span className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
              Estrutura Editorial do Carrossel:
            </span>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {draftCarousel.slides?.map((s, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs flex items-center gap-3"
                >
                  <span className="text-white font-mono font-bold text-[11px] bg-white/[0.06] px-2 py-0.5 rounded-md">
                    0{idx + 1}
                  </span>
                  <span className="text-zinc-300 truncate text-xs font-normal">
                    {s.headline}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Botão para voltar à edição */}
          <div className="pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setWizardStep(2)}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Voltar e Ajustar Lâminas</span>
            </button>
          </div>
        </div>

        {/* COLUNA DIREITA (7 Colunas): Editor de Legenda, Hashtags & Botão Primário */}
        <div className="col-span-12 lg:col-span-7 rounded-2xl bg-white/5 border border-white/10 p-6 lg:p-8 shadow-2xl shadow-black/50 space-y-6">
          {/* Card Header Obrigatório */}
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-black shadow-sm">
                <Edit3 className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight text-white">
                Legenda Executiva &amp; Agendamento
              </h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase tracking-wider">
              Ajuste Fino Manual
            </span>
          </div>

          {/* Legenda do Post (Caption / BodyCopy) */}
          <div className="space-y-2">
            <label
              htmlFor="postCaption"
              className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2"
            >
              Legenda do Post (Caption Completa)
            </label>
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
              className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2"
            >
              Hashtags do Nicho
            </label>
            <input
              id="postHashtags"
              type="text"
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              placeholder="#VendasB2B #BlackLink #InteligenciaComercial"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-xs font-mono text-white placeholder:text-zinc-500 focus:bg-white/[0.07] focus:border-white/30 focus:outline-none transition-all"
            />
          </div>

          {/* Data e Horário Sugerido */}
          <div className="space-y-2">
            <label
              htmlFor="postDate"
              className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2"
            >
              Data e Horário no Cronograma
            </label>
            <input
              id="postDate"
              type="text"
              value={scheduledDateInput}
              onChange={(e) => setScheduledDateInput(e.target.value)}
              placeholder="Ex: Amanhã • 10:00 ou 2026-10-02 14:00"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-xs font-mono text-white placeholder:text-zinc-500 focus:bg-white/[0.07] focus:border-white/30 focus:outline-none transition-all"
            />
          </div>

          {/* Botão Primário: Salvar e Enviar para Cronograma & Aprovação */}
          <div className="pt-6 border-t border-white/10">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveAndRedirect}
              className="w-full h-12 flex items-center justify-center gap-2.5 rounded-xl bg-white text-black font-semibold text-xs tracking-tight hover:bg-zinc-200 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-[0_0_25px_rgba(255,255,255,0.2)] disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                  <span>Salvando no Supabase &amp; Cronograma...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 fill-black" />
                  <span>Enviar para o Cronograma &amp; Aprovar</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-zinc-400 text-center mt-3">
              O ativo será persistido no Supabase na conta do cliente e você será conduzido à mesa de aprovação.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
