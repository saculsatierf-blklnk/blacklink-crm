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
  Image as ImageIcon,
  Eye,
  Camera,
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
  attachedImagePreview?: string;
  suggestedUpdates?: Array<{
    postId: string;
    headline: string;
    bodyText: string;
    tag: string;
    caption: string;
    blackLinkVariant?: any;
    rationale?: string;
  }>;
  imageAction?: {
    shouldGenerate: boolean;
    postId: string;
    variant?: string;
    prompt?: string;
    explanation?: string;
  };
}

interface MarketingAgentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MarketingAgentDrawer({ isOpen, onClose }: MarketingAgentDrawerProps) {
  const { scheduledPosts, updateScheduledPost, companyProfile } = useMarketingStore();

  const [focusedPostId, setFocusedPostId] = useState<string | null>(
    scheduledPosts[0]?.id || null
  );
  const [attachedImage, setAttachedImage] = useState<string | null>(null);

  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: "initial-msg",
      role: "assistant",
      content:
        "**Assistente Executivo da Black Link conectado.**\n\nTenho **visão computacional ativa**: consigo enxergar a arte do post selecionado ou qualquer imagem que você anexar.\n\nVocê pode me pedir para:\n- **Olhar e diagnosticar a imagem atual** do post selecionado.\n- **Regerar a arte** ou mudar o estilo para produtos como CRM OS ou Automações.\n- **Ajustar títulos e legendas** de forma direta e sem rodeios.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      alignmentScore: 92,
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImageForPost, setIsGeneratingImageForPost] = useState<string | null>(null);
  const [appliedFeedback, setAppliedFeedback] = useState<string | null>(null);
  const [expandedPostUpdate, setExpandedPostUpdate] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const focusedPost = scheduledPosts.find((p) => p.id === focusedPostId) || scheduledPosts[0];
  const focusedSlide = focusedPost?.slides?.[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione um arquivo de imagem válido.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAttachedImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (textToSend?: string, actionOverride?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text && !actionOverride && !attachedImage) return;

    const currentAttachedImage = attachedImage;
    const userMsgId = `user-${Date.now()}`;
    const newMessages: AgentMessage[] = [
      ...messages,
      {
        id: userMsgId,
        role: "user",
        content: text || (actionOverride ? `Comando: ${actionOverride}` : "Analise esta imagem anexada."),
        attachedImagePreview: currentAttachedImage || undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];

    setMessages(newMessages);
    setInputMessage("");
    setAttachedImage(null);
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
          focusedPostId: focusedPostId || focusedPost?.id,
          attachedImage: currentAttachedImage,
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
            imageAction: data.imageAction?.shouldGenerate ? data.imageAction : undefined,
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

  const handleExecuteImageGeneration = async (imgAction: NonNullable<AgentMessage["imageAction"]>) => {
    const targetPost = scheduledPosts.find((p) => p.id === imgAction.postId) || focusedPost;
    if (!targetPost) return;

    setIsGeneratingImageForPost(targetPost.id);
    setAppliedFeedback(`Gerando nova imagem com Gemini IA para o Post ${targetPost.id}...`);

    try {
      const res = await fetch("/api/marketing/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variant: imgAction.variant || "3d-cursor",
          customPrompt: imgAction.prompt,
          theme: targetPost.theme,
        }),
      });

      const data = await res.json();
      if (data.success && data.imageUrl) {
        const currentSlides = [...targetPost.slides];
        const s0 = currentSlides[0] || { slideNumber: 1 };
        currentSlides[0] = {
          ...s0,
          imageUrl: data.imageUrl,
          blackLinkVariant: (imgAction.variant as any) || s0.blackLinkVariant,
        };

        updateScheduledPost(targetPost.id, {
          slides: currentSlides,
        });

        setAppliedFeedback(`✨ Nova arte gerada e aplicada ao Post ${targetPost.id}!`);
      } else {
        setAppliedFeedback(`Erro ao gerar imagem: ${data.error || "Tente novamente."}`);
      }
    } catch (err) {
      console.error(err);
      setAppliedFeedback("Falha na geração de imagem.");
    } finally {
      setIsGeneratingImageForPost(null);
      setTimeout(() => setAppliedFeedback(null), 4000);
    }
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
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Painel Lateral Deslizante */}
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
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
                        Diretor de Growth & Visão IA
                      </h3>
                      <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                        Multimodal
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

              {/* Seletor do Post em Foco (Para a IA Enxergar a Arte Específica) */}
              <div className="px-4 py-2.5 bg-black/50 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Eye className="h-3.5 w-3.5 text-sky-400" />
                  <span className="text-[11px] font-mono text-zinc-400">Post em Foco:</span>
                  <select
                    value={focusedPostId || ""}
                    onChange={(e) => setFocusedPostId(e.target.value || null)}
                    className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-mono text-white focus:outline-none focus:border-sky-400 cursor-pointer"
                  >
                    {scheduledPosts.map((p, idx) => (
                      <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                        Post #{idx + 1} — {p.theme}
                      </option>
                    ))}
                  </select>
                </div>

                {focusedPost && (
                  <div className="flex items-center gap-2">
                    {focusedSlide?.imageUrl ? (
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                        <img
                          src={focusedSlide.imageUrl}
                          alt="Thumb"
                          className="h-5 w-5 rounded object-cover border border-white/20"
                        />
                        <span>Arte Visível</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-500">Sem imagem</span>
                    )}
                  </div>
                )}
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
                    onClick={() => handleSendMessage("Analise a imagem deste post selecionado e diga o que você vê.", "diagnostico_visual")}
                    className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>👁️ Diagnosticar Imagem Atual</span>
                  </button>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSendMessage("Gere uma nova arte sofisticada para este post com foco em tecnologia e alto ticket", "gerar_nova_arte")}
                    className="px-3 py-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>🎨 Nova Imagem com IA</span>
                  </button>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSendMessage("Alinhe este post para vender o Black Link CRM OS", "align_crm_os")}
                    className="px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Target className="h-3.5 w-3.5" />
                    <span>🎯 Focar no CRM OS</span>
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
                        {msg.role === "user" ? "Você" : "Diretor IA"}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-600">
                        • {msg.timestamp}
                      </span>
                    </div>

                    <div
                      className={`max-w-[94%] rounded-2xl p-4 text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-white text-black font-medium shadow-md"
                          : "bg-white/[0.04] border border-white/10 text-zinc-200 backdrop-blur-md"
                      }`}
                    >
                      {/* Preview de imagem anexada pelo usuário */}
                      {msg.attachedImagePreview && (
                        <div className="mb-3 rounded-xl overflow-hidden border border-black/20 max-h-48">
                          <img
                            src={msg.attachedImagePreview}
                            alt="Anexo do Usuário"
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      )}

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

                      {/* Card de Ação de Imagem com IA */}
                      {msg.imageAction && msg.imageAction.shouldGenerate && (
                        <div className="mt-4 pt-3 border-t border-sky-500/20 bg-sky-500/[0.06] -mx-4 -mb-4 p-4 rounded-b-2xl space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono font-bold text-sky-300 uppercase flex items-center gap-1.5">
                              <Camera className="h-3.5 w-3.5" />
                              <span>Geração de Arte Recomendada</span>
                            </span>
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-sky-400/20 text-sky-200">
                              {msg.imageAction.variant || "3d-cursor"}
                            </span>
                          </div>

                          {msg.imageAction.explanation && (
                            <p className="text-[11px] text-zinc-300">
                              {msg.imageAction.explanation}
                            </p>
                          )}

                          <button
                            type="button"
                            disabled={isGeneratingImageForPost === msg.imageAction.postId}
                            onClick={() => handleExecuteImageGeneration(msg.imageAction!)}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 text-black font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {isGeneratingImageForPost === msg.imageAction.postId ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin text-black" />
                                <span>Renderizando com Gemini 2.5 Image...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-3.5 w-3.5 text-black" />
                                <span>Gerar Esta Imagem com IA no Post {msg.imageAction.postId}</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}

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
                    <span>Diretor IA analisando imagem e contexto...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input de Envio de Mensagem */}
              <div className="p-4 border-t border-white/10 bg-black/80 backdrop-blur-md space-y-2">
                {/* Preview de imagem anexada pronta para envio */}
                {attachedImage && (
                  <div className="relative inline-block border border-sky-400/40 rounded-xl overflow-hidden p-1 bg-white/5">
                    <img
                      src={attachedImage}
                      alt="Anexo para IA"
                      className="h-16 w-16 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setAttachedImage(null)}
                      className="absolute -top-1 -right-1 bg-black/80 text-white rounded-full p-1 hover:bg-red-500 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <span className="block text-[8px] font-mono text-sky-300 text-center mt-0.5">
                      Pronto para IA
                    </span>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="space-y-2"
                >
                  <div className="relative flex items-end gap-2">
                    {/* Botão de Anexo de Imagem */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      title="Anexar imagem ou print para a IA olhar"
                      className="p-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </button>

                    <div className="relative flex-1">
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
                        placeholder="Dê uma instrução ou pergunte sobre a imagem... (ex: 'a imagem tá preta, regere', 'o que tem nessa arte?')"
                        className="w-full rounded-2xl border border-white/15 bg-white/[0.04] p-3 pr-12 text-xs text-white placeholder-zinc-500 focus:border-sky-400 focus:outline-none resize-none transition-colors"
                      />

                      <button
                        type="submit"
                        disabled={isLoading || (!inputMessage.trim() && !attachedImage)}
                        className="absolute right-2.5 bottom-3 p-2 rounded-xl bg-white text-black hover:bg-zinc-200 disabled:opacity-30 disabled:hover:bg-white transition-all cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 px-1">
                    <span>Visão Computacional Ativa • Gemini 3.8 Flash</span>
                    <span>Anexe imagens com o botão 📷</span>
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
