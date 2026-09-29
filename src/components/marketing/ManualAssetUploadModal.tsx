"use client";

import { useState, useRef } from "react";
import {
  Calendar,
  CheckCircle2,
  FileVideo,
  Image as ImageIcon,
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
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-black/90 p-8 sm:p-10 shadow-2xl shadow-black/90 space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              <UploadCloud className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">
                Upload Manual de Ativo (&quot;A Prateleira&quot;)
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
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3.5 text-xs text-red-300 font-mono">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Dropzone de Arquivos Apple Glass */}
          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-tight text-zinc-300">
              Mídia Física (Arraste Imagens ou Vídeos)
            </label>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? "border-white/50 bg-white/[0.08]"
                  : "border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]"
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {files.map((file, idx) => {
                  const isVideo = file.type.startsWith("video/");
                  return (
                    <div
                      key={idx}
                      className="relative group rounded-2xl border border-white/15 bg-white/[0.03] overflow-hidden aspect-square flex items-center justify-center p-1 shadow-md"
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

                      <div className="absolute bottom-2 left-2 rounded-md bg-black/80 border border-white/10 px-1.5 py-0.2 text-[9px] font-mono text-white">
                        0{idx + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Grid: Tema e Formato */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold tracking-tight text-zinc-300">
                Tema / Título do Ativo *
              </label>
              <input
                type="text"
                required
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Ex: Documentário Institucional de Expansão B2B"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white placeholder:text-zinc-500 focus:bg-white/[0.07] focus:border-white/30 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-tight text-zinc-300">
                Formato
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as CreativeFormat)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs font-mono text-white focus:bg-white/[0.07] focus:border-white/30 focus:outline-none transition-all cursor-pointer"
              >
                <option value="post">Post Único</option>
                <option value="carousel">Carrossel</option>
                <option value="story">Story / Reel</option>
              </select>
            </div>
          </div>

          {/* Legenda (Textarea) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold tracking-tight text-zinc-300">
              Legenda do Post (Copywriting)
            </label>
            <textarea
              rows={4}
              value={bodyCopy}
              onChange={(e) => setBodyCopy(e.target.value)}
              placeholder="Digite a legenda que acompanhará a mídia na publicação..."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 text-xs text-white placeholder:text-zinc-500 focus:bg-white/[0.07] focus:border-white/30 focus:outline-none transition-all resize-y leading-relaxed"
            />
          </div>

          {/* Grid: Hashtags e Data de Agendamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-tight text-zinc-300">
                Hashtags
              </label>
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#VendasB2B #BlackLink"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs font-mono text-white placeholder:text-zinc-500 focus:bg-white/[0.07] focus:border-white/30 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-tight text-zinc-300">
                Data/Hora de Agendamento
              </label>
              <input
                type="text"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                placeholder="Ex: Amanhã • 14:00"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs font-mono text-white placeholder:text-zinc-500 focus:bg-white/[0.07] focus:border-white/30 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Botões do Rodapé */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-white/10">
            <button
              type="button"
              disabled={isUploading}
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isUploading || !theme.trim()}
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-black hover:bg-zinc-200 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-black" />
                  <span>Salvando na Prateleira...</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  <span>Salvar & Adicionar à Prateleira</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
