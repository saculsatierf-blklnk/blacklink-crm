"use client";

import { useState } from "react";
import {
  ArrowRight,
  Brain,
  Building2,
  CheckCircle2,
  Cpu,
  Flame,
  Globe,
  AtSign,
  Layers,
  Lightbulb,
  Loader2,
  RefreshCw,
  Save,
  Search,
  Shield,
  ShieldAlert,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  useMarketingStore,
  type CompetitorItem,
  type ViralMethodAngle,
} from "@/store/useMarketingStore";

export function CompetitorsDiagnosticView() {
  const {
    companyProfile,
    setCompanyProfile,
    competitorsDiagnostic,
    isAnalyzingCompetitors,
    analyzeCompanyAndCompetitors,
    setActiveGrowthTab,
  } = useMarketingStore();

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleResetForm = () => {
    setCompanyProfile({
      name: "",
      instagram: "",
      website: "",
      niche: "",
      products: "",
      bio: "",
      tagline: "",
    });
    setFeedbackMsg("Campos limpos. Insira o site ou dados da nova empresa.");
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    const isInf = companyProfile.profileType === "influencer";
    if (isInf && !companyProfile.instagram?.trim() && !companyProfile.name?.trim()) {
      setFeedbackMsg("No modo Influencer, por favor informe o @Instagram (ex: @diogodefante).");
      setTimeout(() => setFeedbackMsg(null), 4000);
      return;
    }
    if (
      !isInf &&
      !companyProfile.website?.trim() &&
      !companyProfile.instagram?.trim() &&
      !companyProfile.name?.trim()
    ) {
      setFeedbackMsg("Por favor, informe o Site oficial (ex: gofermetais.com.br) ou @Instagram.");
      setTimeout(() => setFeedbackMsg(null), 4000);
      return;
    }
    await analyzeCompanyAndCompetitors();
    const targetLabel =
      companyProfile.instagram ||
      companyProfile.name ||
      companyProfile.website ||
      "perfil";
    setFeedbackMsg(`Diagnóstico de IA concluído para ${targetLabel}! Concorrentes reais, métodos e cronograma gerados.`);
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  const handleAdvanceToPlanning = () => {
    setActiveGrowthTab("planejamento");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner de Contexto da Etapa */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl p-7 lg:p-9 shadow-2xl space-y-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-white/[0.08] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-500/20 text-sky-300 text-xs font-mono font-bold">
                01
              </span>
              <h2 className="text-xl font-semibold text-white tracking-tight font-heading">
                Diagnóstico da Empresa &amp; Inteligência Competitiva
              </h2>
            </div>
            <p className="text-xs text-zinc-400 font-sans max-w-2xl">
              Pesquise por <strong>@Instagram</strong> (ideal para influenciadores, criadores de conteúdo e figuras públicas sem site) OU por <strong>Site Oficial</strong> (para empresas e indústrias). A IA analisa a persona ou setor, mapeia concorrentes e cria o plano editorial completo.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleResetForm}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs font-mono text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer shadow-sm"
            >
              <span>+ Nova Empresa</span>
            </button>

            <button
              type="button"
              disabled={isAnalyzingCompetitors}
              onClick={handleRunAnalysis}
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-black hover:bg-zinc-200 transition-all cursor-pointer shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isAnalyzingCompetitors ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Rastreando Site &amp; Concorrentes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-black" />
                  <span>Executar Scanner com IA</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3.5 text-xs font-mono text-emerald-300 flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Seletor de Tipo de Perfil (Empresa vs Influencer / Creator) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-black/40 border border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
              Tipo de Perfil:
            </span>
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/10">
              <button
                type="button"
                onClick={() => setCompanyProfile({ profileType: "company" })}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  (companyProfile.profileType || "company") === "company"
                    ? "bg-white/[0.15] text-white font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>Empresa / B2B / Indústria</span>
              </button>

              <button
                type="button"
                onClick={() => setCompanyProfile({ profileType: "influencer" })}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  companyProfile.profileType === "influencer"
                    ? "bg-purple-500/25 text-purple-200 font-semibold border border-purple-500/40 shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                <span>Influencer / Creator / Artista</span>
              </button>
            </div>
          </div>

          <span className="text-[11px] font-sans text-zinc-400">
            {companyProfile.profileType === "influencer"
              ? "🌟 Modo Influencer: IA analisa o @Instagram, concorrentes do mesmo nicho e estratégias virais (sem site obrigatório)."
              : "🏢 Modo Empresa: Rastreia o site oficial, mapeia concorrentes de mercado e monta o funil institucional."}
          </span>
        </div>

        {/* Formulário de Input do Core Business */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {companyProfile.profileType === "influencer" ? (
            <>
              {/* Modo Influencer: Instagram em 1º Lugar */}
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-purple-300 font-bold block">
                    @Instagram do Criador / Influencer *
                  </label>
                  <span className="text-[9px] font-mono text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded border border-purple-500/30">
                    Principal
                  </span>
                </div>
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-3 h-3.5 w-3.5 text-purple-400" />
                  <input
                    type="text"
                    value={companyProfile.instagram}
                    onChange={(e) => setCompanyProfile({ instagram: e.target.value })}
                    placeholder="Ex: @diogodefante ou @nome_do_creator"
                    className="w-full h-9.5 rounded-xl border border-purple-500/40 bg-black/50 pl-9.5 pr-3 text-xs text-white font-mono focus:border-purple-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Nome do Creator */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">
                  Nome do Criador (Opcional)
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-3 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={companyProfile.name}
                    onChange={(e) => setCompanyProfile({ name: e.target.value })}
                    placeholder="Ex: Diogo Defante (ou deixe a IA deduzir)"
                    className="w-full h-9.5 rounded-xl border border-white/10 bg-black/40 pl-9.5 pr-3 text-xs text-white focus:border-white/30 focus:outline-none"
                  />
                </div>
              </div>

              {/* Site / Link na Bio (Opcional para creators) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">
                  Link na Bio / Site (Opcional - Pode deixar vazio)
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-3 h-3.5 w-3.5 text-zinc-600" />
                  <input
                    type="text"
                    value={companyProfile.website}
                    onChange={(e) => setCompanyProfile({ website: e.target.value })}
                    placeholder="Ex: linktr.ee/... ou deixe vazio"
                    className="w-full h-9.5 rounded-xl border border-white/5 bg-black/40 pl-9.5 pr-3 text-xs text-zinc-300 font-mono focus:border-white/30 focus:outline-none"
                  />
                </div>
              </div>

              {/* Nicho de Conteúdo */}
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">
                  Nicho de Conteúdo (Opcional)
                </label>
                <input
                  type="text"
                  value={companyProfile.niche}
                  onChange={(e) => setCompanyProfile({ niche: e.target.value })}
                  placeholder="Ex: Humor Caótico, Entretenimento, Podcast..."
                  className="w-full h-9.5 rounded-xl border border-white/10 bg-black/40 px-3.5 text-xs text-white focus:border-white/30 focus:outline-none"
                />
              </div>

              {/* Monetização & Publis */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">
                  Monetização &amp; Produtos (Opcional)
                </label>
                <input
                  type="text"
                  value={companyProfile.products}
                  onChange={(e) => setCompanyProfile({ products: e.target.value })}
                  placeholder="Ex: Publis de marcas, Shows, Canal no YouTube, Comunidade..."
                  className="w-full h-9.5 rounded-xl border border-white/10 bg-black/40 px-3.5 text-xs text-white focus:border-white/30 focus:outline-none"
                />
              </div>
            </>
          ) : (
            <>
              {/* Modo Empresa: Site em 1º Lugar */}
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-sky-400 font-bold block">
                    Site Oficial / Domínio *
                  </label>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    Lido por IA
                  </span>
                </div>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-3 h-3.5 w-3.5 text-sky-400" />
                  <input
                    type="text"
                    value={companyProfile.website}
                    onChange={(e) => setCompanyProfile({ website: e.target.value })}
                    placeholder="Ex: https://gofermetais.com.br"
                    className="w-full h-9.5 rounded-xl border border-sky-500/30 bg-black/50 pl-9.5 pr-3 text-xs text-white font-mono focus:border-sky-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Nome da Empresa */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">
                  Nome da Empresa (Ou extraído do site)
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-3 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={companyProfile.name}
                    onChange={(e) => setCompanyProfile({ name: e.target.value })}
                    placeholder="Ex: Gofer Metais (ou deixe o site preencher)"
                    className="w-full h-9.5 rounded-xl border border-white/10 bg-black/40 pl-9.5 pr-3 text-xs text-white focus:border-white/30 focus:outline-none"
                  />
                </div>
              </div>

              {/* Instagram (Opcional) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">
                  @Instagram (100% Opcional)
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-3 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={companyProfile.instagram}
                    onChange={(e) => setCompanyProfile({ instagram: e.target.value })}
                    placeholder="Ex: @empresa (ou sugerido pela IA)"
                    className="w-full h-9.5 rounded-xl border border-white/10 bg-black/40 pl-9.5 pr-3 text-xs text-white font-mono focus:border-white/30 focus:outline-none"
                  />
                </div>
              </div>

              {/* Nicho / Setor */}
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">
                  Nicho / Setor (Opcional - IA extrai do site)
                </label>
                <input
                  type="text"
                  value={companyProfile.niche}
                  onChange={(e) => setCompanyProfile({ niche: e.target.value })}
                  placeholder="Ex: Estruturas Metálicas, Construção Civil, Saúde..."
                  className="w-full h-9.5 rounded-xl border border-white/10 bg-black/40 px-3.5 text-xs text-white focus:border-white/30 focus:outline-none"
                />
              </div>

              {/* Produtos & Soluções */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">
                  Produtos &amp; Soluções (Opcional - IA extrai do site)
                </label>
                <input
                  type="text"
                  value={companyProfile.products}
                  onChange={(e) => setCompanyProfile({ products: e.target.value })}
                  placeholder="Ex: Deixe vazio para a IA catalogar as soluções diretamente do site oficial"
                  className="w-full h-9.5 rounded-xl border border-white/10 bg-black/40 px-3.5 text-xs text-white focus:border-white/30 focus:outline-none"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* RAIO-X EXECUTIVO DE IA (DOSSIÊ DE POSICIONAMENTO) */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-black/30 p-7 lg:p-9 shadow-2xl backdrop-blur-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <Brain className="h-5 w-5 text-purple-400 shrink-0" />
            <div>
              <h3 className="text-base font-semibold text-white font-heading">
                Dossiê de Contra-Posicionamento da IA
              </h3>
              {companyProfile.tagline && (
                <p className="text-[11px] font-mono text-purple-300 mt-0.5">
                  &quot;{companyProfile.tagline}&quot;
                </p>
              )}
            </div>
          </div>
          <span className="text-[10px] font-mono text-zinc-400 self-start sm:self-auto">
            Atualizado em: {competitorsDiagnostic.lastAnalyzedAt || "Recente"}
          </span>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed font-sans bg-black/40 p-5 rounded-2xl border border-white/5">
          {competitorsDiagnostic.executiveSummary}
        </p>

        {companyProfile.bio && (
          <div className="rounded-2xl border border-white/10 bg-black/50 p-4.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-sky-400 font-bold tracking-wider">
                Proposta de Bio Executiva para o Instagram:
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                {companyProfile.instagram || "@instagram"}
              </span>
            </div>
            <p className="text-xs text-zinc-200 whitespace-pre-line font-sans leading-relaxed">
              {companyProfile.bio}
            </p>
          </div>
        )}
      </div>

      {/* MAPEAMENTO DE CONCORRENTES EM 3 NÍVEIS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Target className="h-4 w-4 text-emerald-400" />
            <h3 className="text-base font-semibold text-white font-heading">
              Mapeamento de Concorrentes em 3 Níveis
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
            {competitorsDiagnostic.competitors.length} players monitorados
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {competitorsDiagnostic.competitors.map((comp) => {
            const isLeader = comp.level === "leader";
            const isDirect = comp.level === "direct";

            return (
              <div
                key={comp.id}
                className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 space-y-4 hover:border-white/20 transition-all shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider border ${
                      isLeader
                        ? "border-purple-500/40 bg-purple-500/15 text-purple-300"
                        : isDirect
                        ? "border-rose-500/40 bg-rose-500/15 text-rose-300"
                        : "border-amber-500/40 bg-amber-500/15 text-amber-300"
                    }`}
                  >
                    {isLeader
                      ? "Nível 1 • Líder Global"
                      : isDirect
                      ? "Nível 2 • Concorrente Direto"
                      : "Nível 3 • Substituto / Indireto"}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white font-heading">
                    {comp.name}
                  </h4>
                  <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                    {comp.handle}
                  </p>
                </div>

                <div className="space-y-2.5 text-xs font-sans">
                  <div className="rounded-xl bg-black/40 p-3 border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">
                      Força do Player:
                    </span>
                    <p className="text-zinc-300 leading-snug">{comp.strength}</p>
                  </div>

                  <div className="rounded-xl bg-black/40 p-3 border border-white/5 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-rose-400 block font-bold">
                      Vulnerabilidade / Clichê:
                    </span>
                    <p className="text-zinc-300 leading-snug">{comp.vulnerabilityOrCliché}</p>
                  </div>

                  <div className="rounded-xl bg-emerald-500/5 p-3 border border-emerald-500/20 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 block font-bold">
                      Nosso Diferencial:
                    </span>
                    <p className="text-emerald-200 leading-snug">{comp.differentiator}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MÉTODOS VIRALIZÁVEIS IDENTIFICADOS COM IA */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2.5">
          <Flame className="h-4 w-4 text-amber-400" />
          <h3 className="text-base font-semibold text-white font-heading">
            Métodos Viralizáveis para os Produtos da Empresa
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {competitorsDiagnostic.viralMethods.map((vm, index) => (
            <div
              key={vm.id}
              className="rounded-3xl border border-white/[0.08] bg-black/40 p-6 space-y-3.5 hover:border-amber-500/30 transition-all shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-amber-300 uppercase bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  Formato #{index + 1} &bull; {vm.suggestedFormat}
                </span>
                <Zap className="h-3.5 w-3.5 text-amber-400" />
              </div>

              <h4 className="text-sm font-semibold text-white font-heading leading-snug">
                &quot;{vm.hookPattern}&quot;
              </h4>

              <div className="space-y-2 text-xs text-zinc-400 font-sans">
                <p>
                  <strong className="text-zinc-200">Mecanismo:</strong> {vm.viralMechanism}
                </p>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  <strong className="text-zinc-400">Por que viraliza no B2B:</strong> {vm.whyItWorks}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTÃO DE AVANÇO PARA A PRÓXIMA ETAPA */}
      <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
        <div className="text-xs font-mono text-zinc-500">
          Etapa 01 concluída &bull; Pronta para alimentar o cronograma
        </div>

        <button
          type="button"
          onClick={handleAdvanceToPlanning}
          className="flex items-center gap-2.5 rounded-xl bg-white px-6 py-3 text-xs font-semibold text-black hover:bg-zinc-200 transition-all cursor-pointer shadow-lg hover:scale-[1.01] active:scale-[0.99]"
        >
          <span>Avançar para Planejamento &amp; Cronograma</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
