"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Sparkles,
  Send,
  Target,
  Zap,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Bot,
  Sliders,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useMarketingStore,
  type ScheduledPost,
} from "@/store/useMarketingStore";

interface AgentMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  alignmentScore?: number;
  highlightedProduct?: string;
  suggestedUpdates?: Array<{
    postId: string;
    headline: string;
    bodyText: string;
    tag: string;
    caption: string;
    blackLinkVariant?: any;
    rationale?: string;
  }>;
}

interface MarketingAgentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MarketingAgentDrawer({ isOpen, onClose }: MarketingAgentDrawerProps) {
  const { scheduledPosts, updateScheduledPost, companyProfile } = useMarketingStore();

  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: "initial-msg",
      role: "assistant",
      content:
        "**Diretoria de Growth da Black Link ativada.**\n\nEstou conectado ao ecossistema do [blklnk.com](https://blklnk.com), ao catálogo de produtos proprietários e aos 9 posts da sua grade atual.\n\nComo posso adaptar ou elevar a presença da Black Link hoje? Você pode me pedir para realinhar a narrativa em torno de um produto digital específico, elevar a agressividade das copies ou auditar toda a esteira.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      alignmentScore: 88,
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [appliedFeedback, setAppliedFeedback] = useState<string | null>(null);
  const [expandedPostUpdate, setExpandedPostUpdate] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string, actionOverride?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text && !actionOverride) return;

    const userMsgId = `user-${Date.now()}`;
    const newMessages: AgentMessage[] = [
      ...messages,
      {
        id: userMsgId,
        role: "user",
        content: text || (actionOverride ? `Comando executivo: ${actionOverride}` : ""),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];

    setMessages(newMessages);
    setInputMessage("");
    setIsLoading(true);

    try {
      const historyPayload = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/marketing/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: text,
          history: historyPayload,
          posts: scheduledPosts,
          companyProfile,
          action: actionOverride || "chat",
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: data.reply || "Diretriz processada.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            alignmentScore: data.alignmentScore,
            highlightedProduct: data.highlightedProduct,
            suggestedUpdates: data.suggestedUpdates || [],
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-err-${Date.now()}`,
            role: "assistant",
            content: `⚠️ Não foi possível processar: ${data.error || "Erro inesperado."}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-err-${Date.now()}`,
          role: "assistant",
          content: "⚠️ Erro de conexão com o agente do Gemini.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySingleUpdate = (update: NonNullable<AgentMessage["suggestedUpdates"]>[0]) => {
    const targetPost = scheduledPosts.find((p) => p.id === update.postId);
    if (!targetPost) return;

    const currentSlides = [...targetPost.slides];
    const s0 = currentSlides[0] || { slideNumber: 1 };
    currentSlides[0] = {
      ...s0,
      headline: update.headline,
      bodyText: update.bodyText,
      tag: update.tag,
      blackLinkVariant: update.blackLinkVariant || s0.blackLinkVariant,
    };

    updateScheduledPost(targetPost.id, {
      slides: currentSlides,
      postCaption: update.caption,
      bodyCopy: update.caption,
      hookHeadline: update.headline,
      theme: update.headline,
    });

    setAppliedFeedback(`Post ${update.postId} atualizado com sucesso!`);
    setTimeout(() => setAppliedFeedback(null), 3000);
  };

  const handleApplyAllUpdates = (updates: NonNullable<AgentMessage["suggestedUpdates"]>) => {
    if (!updates || updates.length === 0) return;

    updates.forEach((u) => {
      handleApplySingleUpdate(u);
    });

    setAppliedFeedback(`✨ ${updates.length} posts foram atualizados na grade do feed!`);
    setTimeout(() => setAppliedFeedback(null), 3500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop escurecido */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Painel Lateral Deslizante */}
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-screen max-w-xl bg-[#09090B] border-l border-white/10 shadow-2xl flex flex-col"
            >
              {/* Header do Agente */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 border border-white/20">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-black" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white font-heading">
                        Diretor de Growth IA
                      </h3>
                      <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                        Black Link
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-mono">
                      Engenharia da Ausência • blklnk.com
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Barra de Status & Alinhamento */}
              <div className="px-5 py-2.5 bg-black/40 border-b border-white/5 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-zinc-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
                  <span className="text-[11px]">Diretrizes de Marca: Ativas</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-bold">9 Posts Sincronizados</span>
                </div>
              </div>

              {/* Feedback de Ação Aplicada */}
              {appliedFeedback && (
                <div className="mx-4 mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-mono text-emerald-300 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{appliedFeedback}</span>
                </div>
              )}

              {/* Pílulas de Ações Rápidas */}
              <div className="p-3 border-b border-white/10 bg-white/[0.01] overflow-x-auto">
                <div className="flex items-center gap-2 min-w-max pb-1">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSendMessage("Alinhe a grade para vender o Black Link CRM OS", "align_crm_os")}
                    className="px-3 py-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Target className="h-3.5 w-3.5" />
                    <span>🎯 Vender CRM OS</span>
                  </button>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSendMessage("Alinhe a grade para focar em Automações e Agentes IA", "align_automacoes")}
                    className="px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span>⚡ Focar em Automações I.A.</span>
                  </button>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSendMessage("Audite a coerência da grade inteira com o site blklnk.com", "audit_feed")}
                    className="px-3 py-1.5 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Sliders className="h-3.5 w-3.5" />
                    <span>🔍 Auditar Grade (9 Posts)</span>
                  </button>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSendMessage("Eleve a agressividade e a sofisticação brutalista de todas as headlines", "sharpen_brutalist")}
                    className="px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>💎 Tom Brutalista Suíço</span>
                  </button>
                </div>
              </div>

              {/* Área de Mensagens (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">
                        {msg.role === "user" ? "Você" : "Diretor IA (Black Link)"}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-600">
                        • {msg.timestamp}
                      </span>
                    </div>

                    <div
                      className={`max-w-[92%] rounded-2xl p-4 text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-white text-black font-medium shadow-md"
                          : "bg-white/[0.04] border border-white/10 text-zinc-200 backdrop-blur-md"
                      }`}
                    >
                      {/* Badge de Alinhamento */}
                      {msg.alignmentScore !== undefined && (
                        <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 font-mono text-[10px] font-bold">
                          <Target className="h-3 w-3" />
                          <span>Aderência à Black Link: {msg.alignmentScore}%</span>
                        </div>
                      )}

                      <div className="whitespace-pre-line font-sans space-y-2">
                        {msg.content}
                      </div>

                      {/* Card de Proposta de Alterações na Grade */}
                      {msg.suggestedUpdates && msg.suggestedUpdates.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-white/10 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono uppercase tracking-wider text-sky-400 font-bold flex items-center gap-1.5">
                              <Layers className="h-3.5 w-3.5" />
                              <span>{msg.suggestedUpdates.length} Posts com Otimização Pronta</span>
                            </span>
                          </div>

                          <div className="space-y-2">
                            {msg.suggestedUpdates.map((up) => {
                              const isExpanded = expandedPostUpdate === up.postId;
                              return (
                                <div
                                  key={up.postId}
                                  className="rounded-xl border border-white/10 bg-black/60 p-3 space-y-2"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">
                                        {up.postId}
                                      </span>
                                      <span className="font-mono font-bold text-white text-[11px] line-clamp-1">
                                        {up.headline}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setExpandedPostUpdate(isExpanded ? null : up.postId)
                                        }
                                        className="text-zinc-400 hover:text-white p-1"
                                      >
                                        {isExpanded ? (
                                          <ChevronUp className="h-3.5 w-3.5" />
                                        ) : (
                                          <ChevronDown className="h-3.5 w-3.5" />
                                        )}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleApplySingleUpdate(up)}
                                        className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white text-zinc-200 hover:text-black font-mono text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                                      >
                                        <CheckCircle2 className="h-3 w-3" />
                                        <span>Aplicar</span>
                                      </button>
                                    </div>
                                  </div>

                                  <div className="text-[10px] text-zinc-400">
                                    <span className="text-zinc-500 font-mono">Tese: </span>
                                    {up.bodyText}
                                  </div>

                                  {isExpanded && (
                                    <div className="space-y-2 pt-2 border-t border-white/5 text-[10px] font-mono text-zinc-400">
                                      <div>
                                        <span className="text-zinc-500">Tag: </span>
                                        <span className="text-sky-300">{up.tag}</span>
                                      </div>
                                      <div>
                                        <span className="text-zinc-500 block mb-1">Legenda Sugerida:</span>
                                        <p className="font-sans text-zinc-300 whitespace-pre-line bg-black/40 p-2 rounded border border-white/5 line-clamp-4">
                                          {up.caption}
                                        </p>
                                      </div>
                                      {up.rationale && (
                                        <div className="text-amber-300/80 italic">
                                          💡 {up.rationale}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Botão de Aplicação Global */}
                          <button
                            type="button"
                            onClick={() => handleApplyAllUpdates(msg.suggestedUpdates!)}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 text-black font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                          >
                            <Sparkles className="h-3.5 w-3.5 text-black" />
                            <span>Aplicar Todas as {msg.suggestedUpdates.length} Sugestões no Feed</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 text-xs font-mono text-sky-400 p-2">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Diretor de IA analisando a grade e arquitetando proposta...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input de Envio de Mensagem */}
              <div className="p-4 border-t border-white/10 bg-black/80 backdrop-blur-md">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="space-y-2"
                >
                  <div className="relative">
                    <textarea
                      rows={2}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Dê uma instrução estratégica para a Black Link... (ex: 'Adapte a grade para vender o CRM para holdings')"
                      className="w-full rounded-2xl border border-white/15 bg-white/[0.04] p-3 pr-12 text-xs text-white placeholder-zinc-500 focus:border-sky-400 focus:outline-none resize-none transition-colors"
                    />

                    <button
                      type="submit"
                      disabled={isLoading || !inputMessage.trim()}
                      className="absolute right-2.5 bottom-3.5 p-2 rounded-xl bg-white text-black hover:bg-zinc-200 disabled:opacity-30 disabled:hover:bg-white transition-all cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 px-1">
                    <span>Shift + Enter para quebrar linha • Treinado em blklnk.com</span>
                    <span>Gemini 3.8 Flash</span>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
