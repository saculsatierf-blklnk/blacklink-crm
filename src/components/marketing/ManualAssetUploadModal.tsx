"use client";

import { useState, useRef } from "react";
import {
  FileVideo,
  Loader2,
  Plus,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useMarketingStore, type CreativeFormat } from "@/store/useMarketingStore";

interface ManualAssetUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ManualAssetUploadModal({
  isOpen,
  onClose,
  onSuccess,
}: ManualAssetUploadModalProps) {
  const { addManualPost } = useMarketingStore();

  const [theme, setTheme] = useState("");
  const [format, setFormat] = useState<CreativeFormat>("post");
  const [bodyCopy, setBodyCopy] = useState("");
  const [hashtags, setHashtags] = useState("#VendasB2B #BlackLink #ProducaoManual");
  const [scheduledDate, setScheduledDate] = useState("Amanhã • 14:00");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFilesSelected = (newFiles: FileList | File[]) => {
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(newFiles).forEach((file) => {
      if (
        file.type.startsWith("image/") ||
        file.type.startsWith("video/")
      ) {
        validFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    });

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
      setPreviews((prev) => [...prev, ...newPreviews]);
      setErrorMessage(null);

      if (validFiles.length > 1 && format !== "carousel") {
        setFormat("carousel");
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme.trim()) {
      setErrorMessage("Por favor, preencha o tema ou título do ativo.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("theme", theme.trim());
      formData.append("format", format);
      formData.append("bodyCopy", bodyCopy.trim());
      formData.append("hashtags", hashtags.trim());
      formData.append("scheduledDate", scheduledDate.trim());

      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/marketing/schedule/manual-upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Falha ao enviar ativo para a prateleira.");
      }

      addManualPost(data.post);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || "Erro desconhecido ao carregar o ativo.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-2xl animate-fadeIn">
      {/* Modal Card com Fórmula Exata de Vidro Apple */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-[#0a0a0a]/95 border border-white/[0.08] p-8 lg:p-10 shadow-2xl backdrop-blur-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Linha de brilho (refração) no topo do card */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Cabeçalho do Modal */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-6">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-black shadow-sm">
                <UploadCloud className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-2xl font-medium tracking-tight text-white">
                  Upload Manual de Ativo
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Hospedagem externa (Premiere, Photoshop, Figma) unificada na esteira de aprovação.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 p-2 text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {errorMessage && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-xs text-red-300 font-mono">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dropzone de Arquivos Apple Glass */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-3">
                Mídia Física (Imagens ou Vídeos)
              </label>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? "border-white/50 bg-white/[0.08]"
                    : "border-white/15 bg-black/20 hover:border-white/30 hover:bg-white/[0.03]"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => e.target.files && handleFilesSelected(e.target.files)}
                  className="hidden"
                />
                <UploadCloud className="h-9 w-9 text-zinc-400 transition-colors" />
                <div className="text-xs text-white">
                  <span className="font-semibold underline underline-offset-4 text-white">Clique para selecionar</span> ou arraste os arquivos aqui
                </div>
                <p className="text-[11px] text-zinc-500">
                  Suporta PNG, JPG, WebP, MP4 e MOV. Múltiplos arquivos formam carrossel.
                </p>
              </div>

              {/* Lista de Pré-visualização de Arquivos Carregados */}
              {files.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                  {files.map((file, idx) => {
                    const isVideo = file.type.startsWith("video/");
                    return (
                      <div
                        key={idx}
                        className="relative group rounded-2xl border border-white/15 bg-black/30 overflow-hidden aspect-square flex items-center justify-center p-1 shadow-md"
                      >
                        {isVideo ? (
                          <div className="flex flex-col items-center justify-center text-zinc-400 gap-1.5">
                            <FileVideo className="h-6 w-6 text-white" />
                            <span className="text-[10px] font-mono truncate max-w-[80px]">
                              {file.name}
                            </span>
                          </div>
                        ) : (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={previews[idx]}
                            alt={file.name}
                            className="h-full w-full object-cover rounded-xl"
                          />
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(idx);
                          }}
                          className="absolute top-2 right-2 rounded-full bg-red-600/90 p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-lg hover:scale-110 active:scale-95"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>

                        <div className="absolute bottom-2 left-2 rounded-md bg-black/80 border border-white/10 px-2 py-0.5 text-[9px] font-mono text-white">
                          0{idx + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Grid: Tema e Formato */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-3">
                  Tema / Título do Ativo *
                </label>
                <input
                  type="text"
                  required
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="Ex: Documentário Institucional de Expansão B2B"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-500 focus:border-white/30 focus:ring-0 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-3">
                  Formato
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as CreativeFormat)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white focus:border-white/30 focus:ring-0 focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="post">Post Único</option>
                  <option value="carousel">Carrossel</option>
                  <option value="story">Story / Reel</option>
                </select>
              </div>
            </div>

            {/* Legenda (Textarea) */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-3">
                Legenda do Post (Copywriting)
              </label>
              <textarea
                rows={4}
                value={bodyCopy}
                onChange={(e) => setBodyCopy(e.target.value)}
                placeholder="Digite a legenda que acompanhará a mídia na publicação..."
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white placeholder:text-zinc-500 focus:border-white/30 focus:ring-0 focus:outline-none transition-colors resize-y leading-relaxed"
              />
            </div>

            {/* Grid: Hashtags e Data de Agendamento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-3">
                  Hashtags
                </label>
                <input
                  type="text"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  placeholder="#VendasB2B #BlackLink"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white placeholder:text-zinc-500 focus:border-white/30 focus:ring-0 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-3">
                  Data/Hora de Agendamento
                </label>
                <input
                  type="text"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  placeholder="Ex: Amanhã • 14:00"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white placeholder:text-zinc-500 focus:border-white/30 focus:ring-0 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Botões do Rodapé */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/[0.08]">
              <button
                type="button"
                disabled={isUploading}
                onClick={onClose}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isUploading || !theme.trim()}
                className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-xs font-semibold text-black hover:bg-zinc-200 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-lg disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-black" />
                    <span>Salvando na Prateleira...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    <span>Salvar &amp; Adicionar à Prateleira</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
