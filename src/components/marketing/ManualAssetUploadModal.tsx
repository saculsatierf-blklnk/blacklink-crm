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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl border border-glass-border bg-carbon p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between border-b border-glass-border/70 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-void">
              <UploadCloud className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-platinum">
                Upload Manual de Ativo (&quot;A Prateleira&quot;)
              </h3>
              <p className="text-[11px] text-sub">
                Hospedagem externa (Premiere, Photoshop, Figma) unificada na esteira de aprovação.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-glass-border p-1.5 text-sub hover:text-platinum hover:bg-void transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400 font-mono">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dropzone de Arquivos */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-sub">
              Mídia Física (Arraste Imagens ou Vídeos)
            </label>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? "border-accent bg-accent/10"
                  : "border-glass-border bg-void/40 hover:border-glass-highlight hover:bg-void/70"
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
              <UploadCloud className="h-8 w-8 text-sub group-hover:text-accent transition-colors" />
              <div className="text-xs font-mono text-platinum">
                <span className="font-bold text-accent">Clique para selecionar</span> ou arraste os arquivos aqui
              </div>
              <p className="text-[10px] text-sub font-mono">
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
                      className="relative group rounded-lg border border-glass-border bg-void/80 overflow-hidden aspect-square flex items-center justify-center p-1"
                    >
                      {isVideo ? (
                        <div className="flex flex-col items-center justify-center text-sub gap-1">
                          <FileVideo className="h-6 w-6 text-accent" />
                          <span className="text-[9px] font-mono truncate max-w-[80px]">
                            {file.name}
                          </span>
                        </div>
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={previews[idx]}
                          alt={file.name}
                          className="h-full w-full object-cover rounded"
                        />
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(idx);
                        }}
                        className="absolute top-1 right-1 rounded-full bg-red-500/80 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>

                      <div className="absolute bottom-1 left-1 rounded bg-void/80 px-1 py-0.2 text-[8px] font-mono text-platinum">
                        0{idx + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Grid: Tema e Formato */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-sub">
                Tema / Título do Ativo *
              </label>
              <input
                type="text"
                required
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Ex: Documentário Institucional de Expansão B2B"
                className="w-full rounded-lg border border-glass-border bg-void/70 p-2.5 text-xs font-sans text-platinum placeholder:text-sub/50 focus:border-glass-highlight focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-sub">
                Formato
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as CreativeFormat)}
                className="w-full rounded-lg border border-glass-border bg-void/70 p-2.5 text-xs font-mono text-platinum focus:border-glass-highlight focus:outline-none"
              >
                <option value="post">Post Único</option>
                <option value="carousel">Carrossel</option>
                <option value="story">Story / Reel</option>
              </select>
            </div>
          </div>

          {/* Legenda (Textarea) */}
          <div className="space-y-1">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-sub">
              Legenda do Post (Copywriting)
            </label>
            <textarea
              rows={4}
              value={bodyCopy}
              onChange={(e) => setBodyCopy(e.target.value)}
              placeholder="Digite a legenda que acompanhará a mídia na publicação..."
              className="w-full rounded-lg border border-glass-border bg-void/70 p-2.5 text-xs font-sans text-platinum placeholder:text-sub/50 focus:border-glass-highlight focus:outline-none resize-y"
            />
          </div>

          {/* Grid: Hashtags e Data de Agendamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-sub">
                Hashtags
              </label>
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#VendasB2B #BlackLink"
                className="w-full rounded-lg border border-glass-border bg-void/70 p-2.5 text-xs font-mono text-platinum placeholder:text-sub/50 focus:border-glass-highlight focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-sub">
                Data/Hora de Agendamento
              </label>
              <input
                type="text"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                placeholder="Ex: Amanhã • 14:00"
                className="w-full rounded-lg border border-glass-border bg-void/70 p-2.5 text-xs font-mono text-platinum placeholder:text-sub/50 focus:border-glass-highlight focus:outline-none"
              />
            </div>
          </div>

          {/* Botões do Rodapé */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-glass-border/70">
            <button
              type="button"
              disabled={isUploading}
              onClick={onClose}
              className="rounded-lg border border-glass-border bg-void/50 px-4 py-2 text-xs font-mono text-sub hover:text-platinum transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isUploading || !theme.trim()}
              className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2 text-xs font-bold font-mono text-void hover:bg-platinum transition-all cursor-pointer shadow-lg hover:shadow-accent/20 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-void" />
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
